type Direction = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'None';
type Shurui = 'student' | 'monk' | 'exorcist';

export interface PlayerData {
  x: number;
  y: number;
  direction: Direction;
  forward: Direction;
  targetX: number;
  targetY: number;
  preX: number;
  preY: number;
  start: number;
  have: number; // 今持っているアイテムの数
  nouhin: number; // 納品したアイテムの数
  shurui: Shurui;
}
