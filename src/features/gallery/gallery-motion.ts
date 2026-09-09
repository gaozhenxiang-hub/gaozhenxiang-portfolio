export type MotionState = {
  current: number;
  target: number;
  velocity: number;
};

export type GalleryVisuals = {
  bend: number;
  skew: number;
  stretch: number;
};

export function clampPosition(value: number, max: number) {
  return Math.min(Math.max(value, 0), Math.max(max, 0));
}

export function createMotionFrame(state: MotionState, deltaMs: number): MotionState {
  const normalizedDelta = Math.min(Math.max(deltaMs / 16.667, 0), 2);
  const distance = state.target - state.current;
  let current = state.current + distance * (1 - Math.pow(0.82, normalizedDelta));

  if (Math.abs(distance) < 0.0005) current = state.target;

  const velocity = normalizedDelta > 0 ? (current - state.current) / normalizedDelta : 0;
  return { current, target: state.target, velocity };
}

export function mapVelocityToVisuals(velocity: number): GalleryVisuals {
  const normalized = Math.max(-1, Math.min(1, velocity / 16));
  const strength = Math.abs(normalized);

  return {
    bend: Number(strength.toFixed(4)),
    skew: Number(normalized.toFixed(4)),
    stretch: Number((1 + strength * 0.035).toFixed(4)),
  };
}
