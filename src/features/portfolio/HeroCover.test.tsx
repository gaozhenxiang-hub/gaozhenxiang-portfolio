import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroCover } from "./HeroCover";

vi.mock("./HeroCanvas", () => ({
  HeroCanvas: () => <div data-testid="hero-canvas" />,
}));

const heroProgressRef = { current: 0 };
const pointerRef = {
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
};

describe("HeroCover", () => {
  it("renders the approved identity and transition cues", () => {
    render(<HeroCover heroProgressRef={heroProgressRef} pointerRef={pointerRef} />);

    expect(screen.getByRole("heading", { name: "高振翔", level: 1 })).toBeVisible();
    expect(screen.getByText("AIGC CREATOR")).toBeVisible();
    expect(screen.getByText("SELECTED WORKS")).toBeInTheDocument();
    expect(screen.getByText("SCROLL TO EXPLORE")).toBeInTheDocument();
    expect(screen.getByTestId("hero-canvas")).toBeVisible();
  });

  it("uses the approved static design as a non-interactive fallback", () => {
    render(<HeroCover heroProgressRef={heroProgressRef} pointerRef={pointerRef} />);

    expect(screen.getByTestId("hero-fallback")).toHaveAttribute(
      "src",
      "/hero/aigc-cover-fallback.png",
    );
  });
});
