export interface DragState {
  isDragging: boolean;
  /** Cumulative container angle in radians (0 = gravity down). */
  containerAngle: number;
}

export const INITIAL_DRAG_STATE: DragState = {
  isDragging: false,
  containerAngle: 0,
};
