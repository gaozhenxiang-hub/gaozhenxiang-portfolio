import { describe, expect, it } from "vitest";

import {
  calculatePointerImpulse,
  calculateDepthRecession,
  calculateDepthTransform,
  calculateDepthVisibility,
  calculateMetadataDepthLayout,
  calculateProjectedMediaHeight,
  clampPosition,
  createMotionFrame,
  createPointerInteractionFrame,
  mapVelocityToVisuals,
  mapPointerDeltaToGallery,
  normalizePointerVelocity,
  projectReleaseTarget,
} from "./gallery-motion";

describe("gallery motion", () => {
  it("clamps position to the content range", () => {
    expect(clampPosition(-20, 900)).toBe(0);
    expect(clampPosition(1200, 900)).toBe(900);
    expect(clampPosition(20, -1)).toBe(0);
  });

  it("eases toward the target and exposes velocity", () => {
    const frame = createMotionFrame({ current: 0, target: 100, velocity: 0 }, 16.667);
    expect(frame.current).toBeGreaterThan(8);
    expect(frame.current).toBeLessThan(15);
    expect(frame.velocity).toBeGreaterThan(0);
  });

  it("settles without overshooting", () => {
    let frame = { current: 0, target: 100, velocity: 0 };
    for (let index = 0; index < 180; index += 1) {
      frame = createMotionFrame(frame, 16.667);
    }
    expect(frame.current).toBeCloseTo(100, 3);
    expect(Math.abs(frame.velocity)).toBeLessThan(0.001);
  });

  it("caps visual deformation and preserves direction", () => {
    expect(mapVelocityToVisuals(1000)).toEqual({
      bend: 1,
      skew: 1,
      stretch: 1.035,
    });
    expect(mapVelocityToVisuals(-1000).skew).toBe(-1);
  });

  it("projects bounded momentum in the release direction", () => {
    expect(projectReleaseTarget(400, 20, 1000)).toBeGreaterThan(400);
    expect(projectReleaseTarget(400, -20, 1000)).toBeLessThan(400);
    expect(projectReleaseTarget(980, 20, 1000)).toBe(1000);
    expect(projectReleaseTarget(580, 360, 5000)).toBeLessThanOrEqual(1040);
  });

  it("matches the source's high-distance mouse drag response", () => {
    expect(mapPointerDeltaToGallery(-100)).toBe(200);
    expect(mapPointerDeltaToGallery(100)).toBe(-200);
  });

  it("normalizes pointer velocity by elapsed time across event rates", () => {
    expect(normalizePointerVelocity(34, 16.667)).toBeCloseTo(1, 3);
    expect(normalizePointerVelocity(17, 8.3335)).toBeCloseTo(1, 3);
    expect(normalizePointerVelocity(-34, 16.667)).toBeCloseTo(-1, 3);
  });

  it("creates pointer energy only from movement or an active drag", () => {
    expect(calculatePointerImpulse(0, false)).toBe(0);
    expect(calculatePointerImpulse(0.2, false)).toBeGreaterThan(0);
    expect(calculatePointerImpulse(0.8, false)).toBeGreaterThan(
      calculatePointerImpulse(0.2, false),
    );
    expect(calculatePointerImpulse(1.5, false)).toBeLessThanOrEqual(1);
    expect(calculatePointerImpulse(0, true)).toBeGreaterThan(0);
  });

  it("moves and scales metadata with the receding media plane", () => {
    const front = calculateMetadataDepthLayout(430, 300, 1400, 350, 1440);
    const receding = calculateMetadataDepthLayout(225, 300, 1400, 350, 1440);
    expect(front).toEqual({ shiftX: 0, shiftY: 0, scale: 1, opacity: 1 });
    expect(receding.shiftX).toBeGreaterThan(0);
    expect(receding.shiftY).toBeGreaterThan(0);
    expect(receding.scale).toBeLessThan(1);
  });

  it("increases depth recession only inside the top approach zone", () => {
    expect(calculateDepthRecession(430)).toBe(0);
    expect(calculateDepthRecession(225)).toBeGreaterThan(0.75);
    expect(calculateDepthRecession(225)).toBeLessThan(1);
    expect(calculateDepthRecession(150)).toBe(1);
    expect(calculateDepthRecession(320)).toBeGreaterThan(0);
    expect(calculateDepthRecession(320)).toBeLessThan(1);
  });

  it("foreshortens media as it moves away from the viewer", () => {
    expect(calculateProjectedMediaHeight(300, 0, 1400)).toBe(300);
    expect(calculateProjectedMediaHeight(300, 1, 1400)).toBeLessThan(40);
  });

  it("keeps receding rows on a vanishing path while depth continues increasing", () => {
    const horizon = calculateDepthTransform(150, 1400);
    const distant = calculateDepthTransform(-300, 1400);
    expect(horizon.screenY).toBeCloseTo(190.32, 2);
    expect(horizon.depth).toBeGreaterThanOrEqual(1500);
    expect(horizon.tilt).toBeGreaterThan(1.1);
    expect(horizon.horizontalCompensation).toBeGreaterThan(1);
    expect(distant.depth).toBeGreaterThan(horizon.depth);
    expect(distant.scale).toBeLessThan(horizon.scale);
    expect(distant.screenY).toBeLessThan(horizon.screenY);
  });

  it("lets pointer energy follow quickly and become visually inactive after stopping", () => {
    const activated = createPointerInteractionFrame(
      {
        x: 0.2,
        y: 0.7,
        targetX: 0.8,
        targetY: 0.3,
        strength: 0,
        targetStrength: 1,
        velocityX: 0.8,
        velocityY: -0.4,
      },
      16.667,
    );
    expect(activated.x).toBeGreaterThan(0.2);
    expect(activated.strength).toBeGreaterThan(0.35);

    let decaying = { ...activated, targetStrength: 0 };
    for (let index = 0; index < 20; index += 1) {
      decaying = createPointerInteractionFrame(decaying, 16.667);
    }
    expect(decaying.strength).toBeGreaterThan(0);
    expect(decaying.strength).toBeLessThan(0.025);
  });

  it("fades a row only after it has travelled beyond the visible depth band", () => {
    expect(calculateDepthVisibility(-60)).toBe(1);
    expect(calculateDepthVisibility(-150)).toBeGreaterThan(0);
    expect(calculateDepthVisibility(-150)).toBeLessThan(1);
    expect(calculateDepthVisibility(-230)).toBe(0);
  });
});
