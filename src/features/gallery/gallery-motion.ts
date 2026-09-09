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

export function projectReleaseTarget(target: number, velocity: number, max: number) {
  const projectedDistance = Math.max(-460, Math.min(460, velocity * 240));
  return clampPosition(target + projectedDistance, max);
}

export function calculateTopCurl(screenY: number) {
  const fullCurlY = 125;
  const noCurlY = 300;
  const progress = Math.min(1, Math.max(0, (noCurlY - screenY) / (noCurlY - fullCurlY)));
  return progress * progress * (3 - 2 * progress);
}

export function pinCurledScreenPosition(screenY: number) {
  const pinY = 140;
  if (screenY >= pinY) return screenY;
  return pinY + (screenY - pinY) * 0.16;
}

export function calculateMetadataCurlShift(screenY: number, mediaHeight: number) {
  const curl = calculateTopCurl(screenY);
  const visualCenterY = pinCurledScreenPosition(screenY) + curl * 32;
  return Math.max(0, screenY - visualCenterY + curl * mediaHeight * 0.43);
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
  const normalized = Math.max(-1, Math.min(1, velocity / 11));
  const strength = Math.abs(normalized);

  return {
    bend: Number(strength.toFixed(4)),
    skew: Number(normalized.toFixed(4)),
    stretch: Number((1 + strength * 0.035).toFixed(4)),
  };
}
