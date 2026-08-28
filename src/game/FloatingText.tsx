// DOM layer for the juice.ts effects that live outside the canvas. Mount both of
// these as siblings of <SceneShell>, never inside it.

import { useFlash, useFloatTexts } from './juice';

export function FloatingTexts() {
  const texts = useFloatTexts();
  return (
    <div className="float-layer">
      {texts.map((t) => (
        <div key={t.id} className={`float-text ${t.kind}`} style={{ left: t.x, top: t.y }}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function ScreenFlash() {
  const active = useFlash();
  if (!active) return null;
  // Keyed on id so a repeat flash restarts the CSS animation instead of
  // reusing the finished one.
  return <div key={active.id} className={`screen-flash ${active.kind}`} />;
}
