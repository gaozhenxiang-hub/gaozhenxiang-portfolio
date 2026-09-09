import { describe, expect, it } from "vitest";

import {
  calculateDepthRecession,
  calculateDepthTransform,
  calculateDepthVisibility,
  calculateMetadataDepthLayout,
  calculateProjectedMediaHeight,
  clampPosition,
  createMotionFrame,
  mapVelocityToVisuals,
  mapPointerDeltaToGallery,
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
    expect(frame.current).toBeGreaterThan(0);
    expect(frame.current).toBeLessThan(100);
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
    expect(calculateDepthRecession(225)).toBe(1);
    expect(calculateDepthRecession(320)).toBeGreaterThan(0);
    expect(calculateDepthRecession(320)).toBeLessThan(1);
  });

  it("foreshortens media as it moves away from the viewer", () => {
    expect(calculateProjectedMediaHeight(300, 0, 1400)).toBe(300);
    expect(calculateProjectedMediaHeight(300, 1, 1400)).toBeLessThan(90);
  });

  it("keeps receding rows on a vanishing path while depth continues increasing", () => {
    const horizon = calculateDepthTransform(225, 1400);
    const distant = calculateDepthTransform(-300, 1400);
    expect(horizon.screenY).toBeCloseTo(225, 4);
    expect(horizon.depth).toBeGreaterThanOrEqual(1500);
    expect(horizon.tilt).toBeGreaterThan(1.1);
    expect(horizon.horizontalCompensation).toBeGreaterThan(1);
    expect(distant.depth).toBeGreaterThan(horizon.depth);
    expect(distant.scale).toBeLessThan(horizon.scale);
    expect(distant.screenY).toBeLessThan(horizon.screenY);
  });

  it("fades a row only after it has travelled beyond the visible depth band", () => {
    expect(calculateDepthVisibility(-60)).toBe(1);
    expect(calculateDepthVisibility(-150)).toBeGreaterThan(0);
    expect(calculateDepthVisibility(-150)).toBeLessThan(1);
    expect(calculateDepthVisibility(-230)).toBe(0);
  });
});
