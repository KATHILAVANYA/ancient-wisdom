/**
 * Generic interactive-overlay regression runner.
 *
 * Uses playwright-core with a system Chrome/Chromium. Browser downloads are
 * intentionally not a hidden side effect of verification.
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import net from 'node:net';
import { homedir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const projectDir = dirname(dirname(fileURLToPath(import.meta.url)));
const defaultRepeats = Math.max(1, Number(process.env.UI_TEST_LOOPS ?? 3));
const startedAt = performance.now();
let server;
let browser;
const serverErrors = [];

function playwrightCacheCandidates() {
  const candidates = [];
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    join(homedir(), '.cache', 'ms-playwright'),
    '/root/.cache/ms-playwright',
  ].filter(Boolean);
  for (const root of roots) {
    if (!existsSync(root)) continue;
    let entries = [];
    try {
      entries = readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || !/^chromium(?:_headless_shell)?-\d+$/.test(entry.name)) {
        continue;
      }
      const directory = join(root, entry.name);
      candidates.push(
        join(directory, 'chrome-linux', 'chrome'),
        join(directory, 'chrome-linux64', 'chrome'),
        join(directory, 'chrome-linux', 'headless_shell'),
        join(directory, 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
      );
    }
  }
  return candidates;
}

function chromeCandidates() {
  const explicit = [process.env.CHROME_PATH, process.env.GOOGLE_CHROME_BIN];
  const fixed = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  const names = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'];
  const fromPath = (process.env.PATH ?? '')
    .split(delimiter)
    .flatMap((directory) => names.map((name) => join(directory, name)));
  return [...explicit, ...fixed, ...playwrightCacheCandidates(), ...fromPath].filter(Boolean);
}

function resolveChrome() {
  const executablePath = chromeCandidates().find((candidate) => existsSync(candidate));
  if (executablePath) return executablePath;
  throw new Error(
    'Chrome/Chromium is required for pnpm test:ui. No executable was found in ' +
      'CHROME_PATH, system paths, or the Playwright browser cache.',
  );
}

async function availablePort() {
  return await new Promise((resolve, reject) => {
    const socket = net.createServer();
    socket.unref();
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', () => {
      const address = socket.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      socket.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitForServer(url) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server?.exitCode != null) {
      throw new Error(`Vite exited before becoming ready (code ${server.exitCode})`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for Vite at ${url}`);
}

function classifyConsoleError(message, origin, appErrors, browserNoise) {
  const text = message.text();
  const location = message.location().url;
  if (
    location.endsWith('/favicon.ico') ||
    location.startsWith('chrome-extension://') ||
    /MetaMask|WebGL|GL_INVALID|GPU process|swiftshader/i.test(text)
  ) {
    browserNoise.push({ text, location });
    return;
  }
  appErrors.push({ text, location: location || origin });
}

async function installEvidenceHooks(context) {
  await context.addInitScript(() => {
    const evidence = {
      pointerLockRequests: [],
      events: [],
      activeSelector: null,
    };
    window.__agon_ui_evidence = evidence;

    Object.defineProperty(Element.prototype, 'requestPointerLock', {
      configurable: true,
      value() {
        const overlay = evidence.activeSelector
          ? document.querySelector(evidence.activeSelector)
          : document.querySelector('[data-game-overlay]');
        const style = overlay instanceof Element ? getComputedStyle(overlay) : null;
        const rect = overlay instanceof Element ? overlay.getBoundingClientRect() : null;
        evidence.pointerLockRequests.push({
          tag: this.tagName,
          overlayVisible: Boolean(
            overlay &&
              style?.display !== 'none' &&
              style?.visibility !== 'hidden' &&
              rect &&
              rect.width > 0 &&
              rect.height > 0,
          ),
        });
      },
    });

    const describe = (node) => {
      if (!(node instanceof Element)) return String(node);
      const action = node.getAttribute('data-game-action');
      const overlay = node.getAttribute('data-game-overlay');
      return `${node.tagName.toLowerCase()}${action ? `[data-game-action="${action}"]` : ''}${
        overlay ? `[data-game-overlay="${overlay}"]` : ''
      }`;
    };
    for (const type of ['pointerdown', 'click']) {
      document.addEventListener(
        type,
        (event) => {
          if (!evidence.activeSelector) return;
          const target = document.querySelector(evidence.activeSelector);
          const path = event.composedPath();
          evidence.events.push({
            type,
            target: describe(event.target),
            path: path.map(describe).slice(0, 10),
            reachedAction: Boolean(target && path.includes(target)),
          });
        },
        true,
      );
    }
  });
}

async function exerciseAction(page, scenario, action, iteration) {
  await page.evaluate(() => {
    window.__agon_ui_evidence.pointerLockRequests.length = 0;
    window.__agon_ui_evidence.events.length = 0;
    window.__agon_ui_evidence.activeSelector = null;
  });
  await page.evaluate(async (name) => window.__agon_ui_test.reset(name), scenario.name);

  const overlay = page.locator(scenario.overlay);
  await overlay.waitFor({ state: 'visible', timeout: 5_000 });
  const requestsAtRest = await page.evaluate(
    () => window.__agon_ui_evidence.pointerLockRequests.length,
  );
  if (requestsAtRest !== 0) {
    throw new Error(`pointer lock requested while ${scenario.name} was visible`);
  }

  const target = page.locator(action.selector);
  if ((await target.count()) !== 1) {
    throw new Error(`${action.selector} resolved to ${await target.count()} elements`);
  }
  if (!(await target.isVisible())) throw new Error(`${action.selector} is not visible`);
  if (!(await target.isEnabled())) throw new Error(`${action.selector} is disabled`);

  const hitTest = await target.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      point: [Math.round(x), Math.round(y)],
      hit: hit?.tagName.toLowerCase() ?? null,
      reachedAction: hit === element || Boolean(hit && element.contains(hit)),
      pointerEvents: hit instanceof Element ? getComputedStyle(hit).pointerEvents : null,
    };
  });
  if (!hitTest.reachedAction || hitTest.pointerEvents === 'none') {
    throw new Error(`elementFromPoint did not reach ${action.selector}`);
  }

  const before = await page.evaluate((name) => window.__agon_ui_test.snapshot(name), scenario.name);
  const beforeJson = JSON.stringify(before);
  await page.evaluate((selector) => {
    window.__agon_ui_evidence.activeSelector = selector;
    window.__agon_ui_evidence.events.length = 0;
  }, action.selector);
  await target.click();

  const overlayExpectation = action.overlay ?? 'dismissed';
  await overlay.waitFor({
    state: overlayExpectation === 'dismissed' ? 'hidden' : 'visible',
    timeout: 5_000,
  });
  const snapshotExpectation = action.snapshot ?? 'changed';
  if (snapshotExpectation === 'changed') {
    await page.waitForFunction(
      ({ name, previous }) => JSON.stringify(window.__agon_ui_test.snapshot(name)) !== previous,
      { name: scenario.name, previous: beforeJson },
      { timeout: 2_000 },
    );
  }

  const after = await page.evaluate((name) => window.__agon_ui_test.snapshot(name), scenario.name);
  const changed = JSON.stringify(after) !== beforeJson;
  if ((snapshotExpectation === 'changed') !== changed) {
    throw new Error(`snapshot was ${changed ? 'changed' : 'unchanged'}, expected ${snapshotExpectation}`);
  }

  const evidence = await page.evaluate(() => ({
    pointerLockRequests: [...window.__agon_ui_evidence.pointerLockRequests],
    events: [...window.__agon_ui_evidence.events],
  }));
  for (const type of ['pointerdown', 'click']) {
    if (!evidence.events.some((event) => event.type === type && event.reachedAction)) {
      throw new Error(`${type} event path did not reach ${action.selector}`);
    }
  }
  if (
    (action.pointerLock ?? 'forbid') === 'forbid' &&
    evidence.pointerLockRequests.length > 0
  ) {
    throw new Error(`${action.selector} requested pointer lock from a modal click`);
  }

  return {
    scenario: scenario.name,
    action: action.name,
    iteration,
    passed: true,
    hitTest,
    events: evidence.events,
    pointerLockRequests: evidence.pointerLockRequests,
    before,
    after,
  };
}

const report = {
  version: 1,
  passed: false,
  browser: null,
  url: null,
  durationMs: 0,
  actions: [],
  appErrors: [],
  browserNoise: [],
  fatalError: null,
};

try {
  const executablePath = resolveChrome();
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  report.browser = executablePath;
  report.url = url;

  server = spawn(
    'pnpm',
    ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: projectDir, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  server.stdout.on('data', () => {});
  server.stderr.on('data', (chunk) => serverErrors.push(String(chunk)));
  await waitForServer(url);

  browser = await chromium.launch({
    executablePath,
    args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 760 } });
  await installEvidenceHooks(context);
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') {
      classifyConsoleError(message, url, report.appErrors, report.browserNoise);
    }
  });
  page.on('pageerror', (error) => {
    report.appErrors.push({ text: error.message, location: url });
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => window.__agon_ui_test?.version === 1,
    null,
    { timeout: 15_000 },
  );
  const scenarios = await page.evaluate(() => window.__agon_ui_test.scenarios());
  if (!scenarios.length) throw new Error('window.__agon_ui_test registered no scenarios');

  for (const scenario of scenarios) {
    for (const action of scenario.actions) {
      const repeats = Number(process.env.UI_TEST_LOOPS ?? scenario.repeat ?? defaultRepeats);
      for (let iteration = 1; iteration <= repeats; iteration += 1) {
        try {
          report.actions.push(await exerciseAction(page, scenario, action, iteration));
        } catch (error) {
          report.actions.push({
            scenario: scenario.name,
            action: action.name,
            iteration,
            passed: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  report.passed =
    report.actions.length > 0 &&
    report.actions.every((action) => action.passed) &&
    report.appErrors.length === 0;
} catch (error) {
  report.fatalError = error instanceof Error ? error.message : String(error);
  if (serverErrors.length) report.fatalError += `\n${serverErrors.join('').slice(-4_000)}`;
} finally {
  if (browser) await browser.close();
  if (server && server.exitCode == null) server.kill('SIGTERM');
  report.durationMs = Math.round(performance.now() - startedAt);
  process.stdout.write(`${JSON.stringify(report)}\n`);
}

if (!report.passed) process.exitCode = 1;
