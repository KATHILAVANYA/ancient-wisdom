/*
 * Procedural textures, drawn on a 2D canvas and handed to drei's `useTexture`
 * as a data URL.
 *
 * This exists as a WORKED EXAMPLE of the texture mandate: a flat
 * `<meshStandardMaterial color="#c9c3b4" />` on a big plane reads as a
 * prototype no matter how good the lighting is, and the `prototype_look` preview
 * check will say so. Ship at least two real maps.
 *
 * For your game, replace this: call `generate_image` for a ground albedo and a
 * hero/wall map, drop the files in `public/`, and load them the same way —
 *
 *   const [albedo, wall] = useTexture(['/ground.png', '/wall.png']);
 *
 * Everything here is drawn locally on purpose. A texture fetched from a CDN
 * suspends inside the Canvas, and a suspend that never resolves renders NOTHING
 * — no scene, no HUD, forever. Local pixels cannot hang.
 */

const GROUND_PX = 256;

let cachedGroundAlbedo = '';

/** Tileable dirt/concrete albedo: base tone, large-scale mottling, fine grain. */
export function groundAlbedoUrl(): string {
  if (cachedGroundAlbedo) return cachedGroundAlbedo;

  const canvas = document.createElement('canvas');
  canvas.width = GROUND_PX;
  canvas.height = GROUND_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#c9c3b4';
  ctx.fillRect(0, 0, GROUND_PX, GROUND_PX);

  // A fixed LCG, not Math.random: the texture must be identical on every load,
  // or two previews of the same scene are not comparable.
  let seed = 0x2f6e2b1;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  // Soft blotches first — they carry the low-frequency variation the eye reads
  // as "a surface" rather than "a fill colour".
  for (let i = 0; i < 90; i++) {
    const r = 14 + rand() * 40;
    const x = rand() * GROUND_PX;
    const y = rand() * GROUND_PX;
    const warm = rand() > 0.5;
    ctx.fillStyle = warm ? 'rgba(196,184,160,0.13)' : 'rgba(168,172,166,0.11)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Then per-pixel grain, so a close "contact" shot still has detail.
  const grain = ctx.getImageData(0, 0, GROUND_PX, GROUND_PX);
  for (let i = 0; i < grain.data.length; i += 4) {
    const n = (rand() - 0.5) * 26;
    grain.data[i] = Math.max(0, Math.min(255, grain.data[i] + n));
    grain.data[i + 1] = Math.max(0, Math.min(255, grain.data[i + 1] + n));
    grain.data[i + 2] = Math.max(0, Math.min(255, grain.data[i + 2] + n));
  }
  ctx.putImageData(grain, 0, 0);

  cachedGroundAlbedo = canvas.toDataURL('image/png');
  return cachedGroundAlbedo;
}
