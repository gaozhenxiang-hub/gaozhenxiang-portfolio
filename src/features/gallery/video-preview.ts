export type PreviewVideo = Pick<
  HTMLVideoElement,
  "currentTime" | "loop" | "muted" | "pause" | "play" | "playsInline"
>;

export function projectVideoElementId(projectId: string) {
  return `project-video-${projectId}`;
}

export function selectProjectTexture<TPoster, TVideo>(
  poster: TPoster,
  video: TVideo | null,
  active: boolean,
): TPoster | TVideo {
  return active && video ? video : poster;
}

export async function setVideoPreviewState(video: PreviewVideo, active: boolean) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  if (active) {
    try {
      await video.play();
    } catch {
      return false;
    }
    return true;
  }

  video.pause();
  video.currentTime = 0;
  return false;
}
