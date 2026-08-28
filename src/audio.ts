// Procedural audio via Web Audio API. No external sound files needed.
//
// Browsers only allow an AudioContext to run after a real user gesture, and a
// context created before one starts 'suspended' and stays silent. So: await
// ensureAudio() from every gesture that could be the first (the Start button,
// the first keypress), not just once at boot. Everything else is
// fire-and-forget and degrades to silence if audio is unavailable.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unavailable = false;

const MASTER_VOLUME = 0.8;

function createCtx(): AudioContext | null {
  if (ctx || unavailable) return ctx;
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    unavailable = true;
    return null;
  }
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(ctx.destination);
  } catch {
    unavailable = true;
    ctx = null;
    master = null;
  }
  return ctx;
}

/**
 * Create/resume the audio context. Call (and await, if you care) from a user
 * gesture handler. Safe to call repeatedly — it is a no-op once running.
 */
export async function ensureAudio(): Promise<void> {
  const ac = createCtx();
  if (!ac) return;
  if (ac.state === 'running') return;
  try {
    await ac.resume();
  } catch {
    /* gesture was not accepted; the next one will retry */
  }
}

/** Fire-and-forget form of ensureAudio() for callers that cannot await. */
export function initAudio(): void {
  void ensureAudio();
}

/** Master volume, 0..1. */
export function setMasterVolume(volume: number): void {
  if (master) master.gain.value = Math.max(0, Math.min(1, volume));
}

function getCtx(): AudioContext | null {
  if (!ctx || ctx.state === 'closed') return null;
  // A tab switch can suspend a running context; nudge it back without blocking.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Destination every voice connects to, so master volume actually applies. */
function bus(): AudioNode {
  return master ?? ctx!.destination;
}

function envelope(gain: GainNode, attack: number, decay: number, volume: number): void {
  const now = gain.context.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);
}

/**
 * Short percussive hit — for collisions, damage, impacts.
 * @param pitchVariation 0-1 range, randomizes frequency ±30%
 */
export function playHit(pitchVariation = 0.3): void {
  const ac = getCtx();
  if (!ac) return;
  const baseFreq = 120 + (Math.random() - 0.5) * 2 * pitchVariation * 60;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(baseFreq, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.15);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ac.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.12);

  osc.connect(filter).connect(gain).connect(bus());
  envelope(gain, 0.005, 0.15, 0.35);
  osc.start();
  osc.stop(ac.currentTime + 0.2);
}

/**
 * Upward sweep — for jumps, launches, boosts.
 */
export function playJump(pitchVariation = 0.2): void {
  const ac = getCtx();
  if (!ac) return;
  const baseFreq = 280 + (Math.random() - 0.5) * 2 * pitchVariation * 80;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, ac.currentTime + 0.12);

  osc.connect(gain).connect(bus());
  envelope(gain, 0.01, 0.12, 0.25);
  osc.start();
  osc.stop(ac.currentTime + 0.18);
}

/**
 * Bright chime — for collectibles, coins, pickups.
 */
export function playCollect(pitchVariation = 0.15): void {
  const ac = getCtx();
  if (!ac) return;
  const baseFreq = 880 + (Math.random() - 0.5) * 2 * pitchVariation * 200;

  // Two detuned oscillators for shimmer
  for (let i = 0; i < 2; i++) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq + i * 12, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5 + i * 20, ac.currentTime + 0.08);
    osc.connect(gain).connect(bus());
    envelope(gain, 0.005, 0.2, 0.18);
    osc.start();
    osc.stop(ac.currentTime + 0.25);
  }
}

/**
 * Low rumble + noise burst — for death, explosion, game over.
 */
export function playDeath(pitchVariation = 0.1): void {
  const ac = getCtx();
  if (!ac) return;
  const baseFreq = 80 + (Math.random() - 0.5) * 2 * pitchVariation * 30;

  // Sub rumble
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(baseFreq, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, ac.currentTime + 0.5);
  osc.connect(gain).connect(bus());
  envelope(gain, 0.01, 0.5, 0.4);
  osc.start();
  osc.stop(ac.currentTime + 0.6);

  // White noise burst
  const bufferSize = ac.sampleRate * 0.3;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ac.createBufferSource();
  const noiseGain = ac.createGain();
  const filter = ac.createBiquadFilter();
  noise.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, ac.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.3);
  noise.connect(filter).connect(noiseGain).connect(bus());
  envelope(noiseGain, 0.005, 0.3, 0.25);
  noise.start();
}

/**
 * Rising arpeggio — for combos, multiplier increases, streaks.
 */
export function playCombo(pitchVariation = 0.1): void {
  const ac = getCtx();
  if (!ac) return;
  const base = 440 + (Math.random() - 0.5) * 2 * pitchVariation * 60;
  const notes = [1, 1.25, 1.5, 2]; // major chord arpeggio

  notes.forEach((ratio, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(base * ratio, ac.currentTime + i * 0.06);
    osc.connect(gain).connect(bus());
    const t = ac.currentTime + i * 0.06;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}
