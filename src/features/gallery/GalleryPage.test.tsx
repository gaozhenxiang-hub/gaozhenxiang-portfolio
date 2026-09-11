import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GalleryPage } from "./GalleryPage";

const canvasProps = vi.hoisted(() => ({ motionRef: null as unknown, pointerRef: null as unknown }));

vi.mock("./GalleryCanvas", () => ({
  GalleryCanvas: (props: { motionRef: unknown; pointerRef: unknown }) => {
    canvasProps.motionRef = props.motionRef;
    canvasProps.pointerRef = props.pointerRef;
    return <div data-testid="gallery-canvas" />;
  },
}));

const sharedMotion = {
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
};

const renderGallery = () => render(<GalleryPage {...sharedMotion} />);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GalleryPage", () => {
  it("passes the shared experience motion into the WebGL gallery", () => {
    renderGallery();

    expect(canvasProps.motionRef).toBe(sharedMotion.motionRef);
    expect(canvasProps.pointerRef).toBe(sharedMotion.pointerRef);
  });

  it("renders the captured gallery hierarchy and all projects", () => {
    renderGallery();

    expect(screen.getByRole("heading", { name: "Selected Works" })).toBeVisible();
    expect(screen.getByText("Blue Portal")).toBeVisible();
    expect(screen.getAllByTestId("project-card")).toHaveLength(24);
    expect(screen.getByTestId("gallery-stage")).toHaveAttribute("data-dragging", "false");
    expect(screen.getByTestId("gallery-canvas")).toBeVisible();
    expect(screen.getByTestId("gallery-top-veil")).toBeVisible();
    expect(screen.queryByTestId("gallery-metadata-mask")).not.toBeInTheDocument();
  });

  it("omits the project category filter row", () => {
    renderGallery();

    expect(screen.queryByText("All")).not.toBeInTheDocument();
    expect(screen.queryByText("Branding")).not.toBeInTheDocument();
    expect(screen.queryByText("Experiment")).not.toBeInTheDocument();
  });

  it("omits the original studio brand and top navigation", () => {
    renderGallery();

    expect(screen.queryByText("unseen studio")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Menu")).not.toBeInTheDocument();
  });

  it("renders the approved contact finale with callable links", () => {
    renderGallery();

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

  it("activates only one of the twelve video previews at a time", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => undefined);
    renderGallery();

    const cards = screen.getAllByTestId("project-card");
    expect(screen.getAllByTestId("project-video")).toHaveLength(12);
    expect(cards[0].querySelector("video")).toBeNull();
    expect(screen.getAllByText("Cinematic Study")).toHaveLength(3);

    fireEvent.pointerEnter(cards[12].querySelector(".project-media")!);
    await waitFor(() => expect(cards[12]).toHaveAttribute("data-preview", "playing"));
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.pointerEnter(cards[13].querySelector(".project-media")!);
    await waitFor(() => expect(cards[13]).toHaveAttribute("data-preview", "playing"));
    expect(cards[12]).toHaveAttribute("data-preview", "idle");
    expect(pause).toHaveBeenCalled();

    fireEvent.pointerLeave(cards[13].querySelector(".project-media")!);
    await waitFor(() => expect(cards[13]).toHaveAttribute("data-preview", "idle"));
  });
});
