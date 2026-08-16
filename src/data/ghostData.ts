type Direction = 'gUp' | 'gDown' | 'gLeft' | 'gRight' | 'gNone';
type GhostType = 'random' | 'chase';

export interface GhostData {
    gtype: GhostType;
    gx: number;
    gy: number;
    ginterval: number;
    gtargetX: number;
    gtargetY: number;
    gpreX: number;
    gpreY: number;
    gstart: number;
    gdirect: Direction;
  }
