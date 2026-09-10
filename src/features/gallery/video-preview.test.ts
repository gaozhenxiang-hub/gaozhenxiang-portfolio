import { describe, expect, it, vi } from "vitest";

import {
  projectVideoElementId,
  selectProjectTexture,
  setVideoPreviewState,
} from "./video-preview";

describe("video preview", () => {
  it("starts muted looping playback while active", async () => {
    const video = {
      muted: false,
      loop: false,
      playsInline: false,
      currentTime: 4,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
    };

    await setVideoPreviewState(video, true);

    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.play).toHaveBeenCalledOnce();
    expect(video.pause).not.toHaveBeenCalled();
  });

  it("pauses and resets after pointer exit", async () => {
    const video = {
      muted: true,
      loop: true,
      playsInline: true,
      currentTime: 4,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
    };

    await setVideoPreviewState(video, false);

    expect(video.pause).toHaveBeenCalledOnce();
    expect(video.currentTime).toBe(0);
    expect(video.play).not.toHaveBeenCalled();
  });

  it("keeps the poster unless an active video texture exists", () => {
    expect(selectProjectTexture("poster", null, true)).toBe("poster");
    expect(selectProjectTexture("poster", "video", false)).toBe("poster");
    expect(selectProjectTexture("poster", "video", true)).toBe("video");
    expect(projectVideoElementId("cold-blue")).toBe("project-video-cold-blue");
  });
});
