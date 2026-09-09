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
    expect(screen.getAllByTestId("project-card")).toHaveLength(22);
    expect(screen.getByTestId("gallery-stage")).toHaveAttribute("data-dragging", "false");
    expect(screen.getByTestId("gallery-canvas")).toBeVisible();
    expect(screen.getByTestId("gallery-top-veil")).toBeVisible();
    expect(screen.queryByTestId("gallery-metadata-mask")).not.toBeInTheDocument();
  });

  it("renders the captured filter labels as non-interactive display controls", () => {
    render(<GalleryPage />);

    expect(screen.getByText("All")).toBeVisible();
    expect(screen.getByText("Branding")).toBeVisible();
    expect(screen.getByText("Experiment")).toBeVisible();
  });

  it("renders the approved contact finale with callable links", () => {
    render(<GalleryPage />);

    expect(screen.getByTestId("contact-finale")).toBeVisible();
    expect(screen.getByRole("heading", { name: "高振翔" })).toBeVisible();
    expect(screen.getByText("AIGC CREATOR")).toBeVisible();
    expect(screen.getByRole("link", { name: /电话 13293941800/ })).toHaveAttribute(
      "href",
      "tel:13293941800",
    );
    expect(screen.getByRole("link", { name: /邮箱 13293941800@163.com/ })).toHaveAttribute(
      "href",
      "mailto:13293941800@163.com",
    );
  });
});
