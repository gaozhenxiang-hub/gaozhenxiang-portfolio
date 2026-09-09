import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GalleryPage } from "./GalleryPage";

vi.mock("./GalleryCanvas", () => ({
  GalleryCanvas: () => <div data-testid="gallery-canvas" />,
}));

vi.mock("./useDragGallery", () => ({
  useDragGallery: () => ({
    stageRef: { current: null },
    motionRef: { current: { current: 0, target: 0, velocity: 0 } },
  }),
}));

describe("GalleryPage", () => {
  it("renders the captured gallery hierarchy and all projects", () => {
    render(<GalleryPage />);

    expect(screen.getByRole("heading", { name: "Selected Projects" })).toBeVisible();
    expect(screen.getByText("Hubtown")).toBeVisible();
    expect(screen.getAllByTestId("project-card")).toHaveLength(12);
    expect(screen.getByTestId("gallery-stage")).toHaveAttribute("data-dragging", "false");
    expect(screen.getByTestId("gallery-canvas")).toBeVisible();
  });

  it("renders the captured filter labels as non-interactive display controls", () => {
    render(<GalleryPage />);

    expect(screen.getByText("All")).toBeVisible();
    expect(screen.getByText("Branding")).toBeVisible();
    expect(screen.getByText("Experiment")).toBeVisible();
  });
});
