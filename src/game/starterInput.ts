/**
 * Browser input adapter. It translates device state into domain commands;
 * neither keyboard events nor key codes enter the pure simulation.
 */

import { consumePress, moveAxes } from './input';
import type { StarterCommand } from './starterState';

export function readStarterCommands(): StarterCommand[] {
  const axes = moveAxes();
  const commands: StarterCommand[] = [{ type: 'move', x: axes.x, z: -axes.y }];
  if (consumePress('space')) commands.push({ type: 'jump' });
  return commands;
}
