import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PortfolioExperience } from "./PortfolioExperience";

const sharedRefs = vi.hoisted(() => ({
  heroProgressRef: { current: 0 },
  motionRef: { current: { current: 0, target: 0, velocity: 0 } },
  pointerRef: {
    current: {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      strength: 0,
      targetStrength: 0,
      velocityX: 0,
      velocityY: 0,
    },
  },
  stageRef: { current: null },
}));

const received = vi.hoisted(() => ({
  galleryMotionRef: null as unknown,
  galleryPointerRef: null as unknown,
  heroProgressRef: null as unknown,
  heroPointerRef: null as unknown,
}));

vi.mock("./usePortfolioMotion", () => ({
  usePortfolioMotion: () => sharedRefs,
}));

vi.mock("./HeroCover", () => ({
  HeroCover: (props: { heroProgressRef: unknown; pointerRef: unknown }) => {
    received.heroProgressRef = props.heroProgressRef;
    received.heroPointerRef = props.pointerRef;
    return <section data-testid="hero-cover" />;
  },
}));

vi.mock("@/features/gallery/GalleryPage", () => ({
  GalleryPage: (props: { motionRef: unknown; pointerRef: unknown }) => {
    received.galleryMotionRef = props.motionRef;
    received.galleryPointerRef = props.pointerRef;
    return <section data-testid="gallery-stage" />;
  },
}));

describe("PortfolioExperience", () => {
  it("connects the cover and gallery to one motion controller", () => {
    render(<PortfolioExperience />);

    expect(screen.getByTestId("portfolio-experience")).toHaveAttribute("data-phase", "hero");
    expect(screen.getByTestId("hero-cover")).toBeVisible();
    expect(screen.getByTestId("gallery-stage")).toBeVisible();
    expect(received.heroProgressRef).toBe(sharedRefs.heroProgressRef);
    expect(received.heroPointerRef).toBe(sharedRefs.pointerRef);
    expect(received.galleryMotionRef).toBe(sharedRefs.motionRef);
    expect(received.galleryPointerRef).toBe(sharedRefs.pointerRef);
  });
});
