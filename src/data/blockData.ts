export interface BlockMovement {
  readonly fromX: number;
  readonly fromY: number;
  readonly startedAtSeconds: number;
  readonly intervalSeconds: number;
}

export interface BlockData {
  x: number;
  y: number;
  renderX?: number;
  renderY?: number;
  movement?: BlockMovement;
}
