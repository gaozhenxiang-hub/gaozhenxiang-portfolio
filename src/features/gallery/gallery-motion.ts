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

export function mapPointerDeltaToGallery(pointerDelta: number) {
  return -pointerDelta * 2;
}

export function calculateDepthRecession(screenY: number) {
  const startY = 420;
  const fullDepthY = 225;
  const progress = Math.min(1, Math.max(0, (startY - screenY) / (startY - fullDepthY)));
  return progress * progress * (3 - 2 * progress);
}

export function calculateDepthVisibility(screenY: number) {
  const progress = Math.min(1, Math.max(0, (screenY + 220) / 140));
  return progress * progress * (3 - 2 * progress);
}

export function calculateProjectedMediaHeight(
  mediaHeight: number,
  recession: number,
  cameraDistance: number,
) {
  const depth = recession * 1600;
  const tilt = recession * 1.18;
  const perspectiveScale = cameraDistance / (cameraDistance + depth);
  return mediaHeight * perspectiveScale * Math.max(0.08, Math.cos(tilt));
}

export function calculateDepthTransform(screenY: number, cameraDistance: number) {
  const recession = calculateDepthRecession(screenY);
  const overflow = Math.max(0, 225 - screenY);
  const depth = recession * 1600 + overflow * 6.4;
  const tilt = recession * 1.18 + Math.min(0.18, overflow * 0.0006);
  const scale = cameraDistance / (cameraDistance + depth);
  const horizontalCompensation = Math.pow(1 / scale, recession * 0.9);
  const vanishingPathY = 225 + (screenY - 225) * 0.18;
  const projectedScreenY = screenY + (vanishingPathY - screenY) * recession;

  return {
    recession,
    depth,
    tilt,
    scale,
    horizontalCompensation,
    screenY: projectedScreenY,
  };
}

export function calculateMetadataDepthLayout(
  screenY: number,
  mediaHeight: number,
  cameraDistance: number,
  cardCenterX: number,
  viewportWidth: number,
) {
  const transform = calculateDepthTransform(screenY, cameraDistance);
  const projectedHeight = mediaHeight * transform.scale * Math.max(0.08, Math.cos(transform.tilt));
  const rawMetadataTop = screenY + mediaHeight / 2;
  const projectedMetadataTop = transform.screenY + projectedHeight / 2;
  const projectedHorizontalScale = transform.scale * transform.horizontalCompensation;

  return {
    shiftX: Number(((viewportWidth / 2 - cardCenterX) * (1 - projectedHorizontalScale)).toFixed(4)),
    shiftY: Number((rawMetadataTop - projectedMetadataTop).toFixed(4)),
    scale: Number(transform.scale.toFixed(4)),
    opacity: Number(calculateDepthVisibility(screenY).toFixed(4)),
  };
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
