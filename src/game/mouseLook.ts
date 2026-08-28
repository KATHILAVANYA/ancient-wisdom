// Pointer-lock mouse look. Request the lock from a user gesture (the Start
// button counts), then drain the accumulated movement once per frame with
// consumeLookDelta. No smoothing, no acceleration — raw movementX/Y.
//
// Games where the mouse is a TOOL (builders, pickers, puzzle panels) should NOT
// use this; they use ordinary pointer events and never lock the cursor.

let dx = 0;
let dy = 0;
let installed = false;

export function installMouseLook(): () => void {
  if (installed) return () => {};
  installed = true;
  const onMove = (e: MouseEvent) => {
    if (document.pointerLockElement) {
      dx += e.movementX;
      dy += e.movementY;
    }
  };
  document.addEventListener('mousemove', onMove);
  return () => {
    document.removeEventListener('mousemove', onMove);
    installed = false;
  };
}

/** Request pointer lock directly from a user gesture. Game state owns lifecycle policy. */
export function lockPointer(): void {
  const canvas = document.querySelector('canvas');
  if (!canvas?.requestPointerLock || document.pointerLockElement === canvas) return;
  try {
    const pending = canvas.requestPointerLock();
    if (pending && typeof pending.catch === 'function') {
      void pending.catch(() => {
        // The game decides whether and when a later gesture should retry.
      });
    }
  } catch {
    // Some browsers throw synchronously during their post-Escape cooldown.
  }
}

export function isPointerLocked(): boolean {
  return !!document.pointerLockElement;
}

/** Returns accumulated look movement since the last call, then resets it. */
export function consumeLookDelta(): { dx: number; dy: number } {
  const out = { dx, dy };
  dx = 0;
  dy = 0;
  return out;
}
