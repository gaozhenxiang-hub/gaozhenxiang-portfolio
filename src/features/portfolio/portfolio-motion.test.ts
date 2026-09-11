import { describe, expect, it } from "vitest";

import {
  calculateExperienceLayout,
  mapHeroProgressToVisuals,
  smoothRange,
} from "./portfolio-motion";

describe("portfolio motion", () => {
  it("holds the gallery at zero until the hero travel completes", () => {
    expect(calculateExperienceLayout(0, 900)).toEqual({ heroProgress: 0, galleryPosition: 0 });
    expect(calculateExperienceLayout(450, 900)).toEqual({ heroProgress: 0.5, galleryPosition: 0 });
    expect(calculateExperienceLayout(900, 900)).toEqual({ heroProgress: 1, galleryPosition: 0 });
    expect(calculateExperienceLayout(1120, 900)).toEqual({ heroProgress: 1, galleryPosition: 220 });
  });

  it("clamps invalid or reversed travel values", () => {
    expect(calculateExperienceLayout(-50, 900)).toEqual({ heroProgress: 0, galleryPosition: 0 });
    expect(calculateExperienceLayout(50, 0)).toEqual({ heroProgress: 1, galleryPosition: 50 });
  });

  it("maps the three approved transition phases", () => {
    const idle = mapHeroProgressToVisuals(0);
    const opening = mapHeroProgressToVisuals(0.45);
    const handoff = mapHeroProgressToVisuals(1);

    expect(idle.portalOpen).toBe(0);
    expect(idle.filmRetreat).toBe(0);
    expect(idle.copyOpacity).toBe(1);
    expect(opening.portalOpen).toBeGreaterThan(0.25);
    expect(opening.filmRetreat).toBeGreaterThan(0);
    expect(opening.copyOpacity).toBeGreaterThan(0);
    expect(handoff.portalOpen).toBe(1);
    expect(handoff.filmRetreat).toBe(1);
    expect(handoff.copyOpacity).toBe(0);
    expect(handoff.galleryReveal).toBe(1);
  });

  it("smooths a bounded range without overshooting", () => {
    expect(smoothRange(0.1, 0.22, 0.68)).toBe(0);
    expect(smoothRange(0.45, 0.22, 0.68)).toBeCloseTo(0.5, 5);
    expect(smoothRange(0.9, 0.22, 0.68)).toBe(1);
  });
});
