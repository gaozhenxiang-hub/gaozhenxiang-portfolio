export type MotionState = {
  current: number;
  target: number;
  velocity: number;
};

export type PointerInteractionState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  strength: number;
  targetStrength: number;
  velocityX: number;
  velocityY: number;
};

export type GalleryVisuals = {
  bend: number;
  skew: number;
  stretch: number;
};

export function calculateGalleryMaximum(
  contentTop: number,
  contentHeight: number,
  viewportHeight: number,
) {
  return Math.max(0, contentTop + contentHeight - viewportHeight);
}

export function calculateContactProgress(current: number, maximum: number, viewportHeight: number) {
  if (maximum <= 0 || viewportHeight <= 0) return 0;
  const start = maximum - viewportHeight * 0.9;
  const end = maximum - viewportHeight * 0.18;
  return Math.min(1, Math.max(0, (current - start) / Math.max(end - start, 1)));
}

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

export function normalizePointerVelocity(deltaPx: number, elapsedMs: number) {
  const perReferenceFrame = (deltaPx / Math.max(elapsedMs, 1)) * 16.667;
  return Math.max(-1, Math.min(1, perReferenceFrame / 34));
}

export function calculatePointerImpulse(speed: number, dragging: boolean) {
  const movement = Math.max(0, speed) * 1.15;
  return Math.min(1, movement + (dragging ? 0.28 : 0));
}

export function calculateDepthRecession(screenY: number) {
  const startY = 420;
  const fullDepthY = 150;
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
  const depth = recession * 2200;
  const tilt = Math.pow(recession, 0.78) * 1.34;
  const perspectiveScale = cameraDistance / (cameraDistance + depth);
  return mediaHeight * perspectiveScale * Math.max(0.08, Math.cos(tilt));
}

export function calculateDepthTransform(screenY: number, cameraDistance: number) {
  const recession = calculateDepthRecession(screenY);
  const overflow = Math.max(0, 150 - screenY);
  const depth = recession * 2200 + overflow * 6.4;
  const tilt = Math.pow(recession, 0.78) * 1.34 + Math.min(0.16, overflow * 0.0005);
  const scale = cameraDistance / (cameraDistance + depth);
  const horizontalCompensation = Math.pow(1 / scale, recession * 0.92);
  const vanishingPathY = 198 + (screenY - 198) * 0.16;
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
  let current = state.current + distance * (1 - Math.pow(0.88, normalizedDelta));

  if (Math.abs(distance) < 0.0005) current = state.target;

  const velocity = normalizedDelta > 0 ? (current - state.current) / normalizedDelta : 0;
  return { current, target: state.target, velocity };
}

export function createPointerInteractionFrame(
  state: PointerInteractionState,
  deltaMs: number,
): PointerInteractionState {
  const normalizedDelta = Math.min(Math.max(deltaMs / 16.667, 0), 2);
  const positionFollow = 1 - Math.pow(0.58, normalizedDelta);
  const strengthBase = state.targetStrength > state.strength ? 0.55 : 0.78;
  const strengthFollow = 1 - Math.pow(strengthBase, normalizedDelta);
  const strength = state.strength + (state.targetStrength - state.strength) * strengthFollow;
  const velocityDecay = Math.pow(0.72, normalizedDelta);

  return {
    ...state,
    x: state.x + (state.targetX - state.x) * positionFollow,
    y: state.y + (state.targetY - state.y) * positionFollow,
    strength: Math.abs(strength - state.targetStrength) < 0.0005 ? state.targetStrength : strength,
    velocityX: state.velocityX * velocityDecay,
    velocityY: state.velocityY * velocityDecay,
  };
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
