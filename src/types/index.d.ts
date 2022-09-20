interface canvasPoint {
  x: number;
  y: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  left?: number;
  top?: number;
  selectable?: boolean;
  hasBorders?: boolean;
  hasControls?: boolean;
  evented?: boolean;
  originX?: string;
  originY?: string;
  id?: number;
  objectCaching?: boolean;
}
