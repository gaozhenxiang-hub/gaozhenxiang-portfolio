import { describe, expect, it } from "vitest";

import {
  clampPosition,
  createMotionFrame,
  mapVelocityToVisuals,
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
});
