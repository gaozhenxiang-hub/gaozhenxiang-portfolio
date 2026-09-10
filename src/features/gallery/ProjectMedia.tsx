"use client";

/* eslint-disable @next/next/no-img-element -- local poster assets also back the WebGL texture layer */

import { useEffect, useRef } from "react";

import type { Project } from "@/content/projects";
import { projectVideoElementId, setVideoPreviewState } from "./video-preview";

type ProjectMediaProps = {
  project: Project;
  active: boolean;
  onActivate: (projectId: string) => void;
  onDeactivate: (projectId: string) => void;
};

export function ProjectMedia({
  project,
  active,
  onActivate,
  onDeactivate,
}: ProjectMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active && !wasActiveRef.current) return;
    void setVideoPreviewState(video, active);
    wasActiveRef.current = active;
  }, [active]);

  return (
    <div
      className="project-media project-media--fallback"
      onPointerEnter={() => onActivate(project.id)}
      onPointerLeave={() => onDeactivate(project.id)}
    >
      {project.video ? (
        <video
          aria-label={`${project.title} preview`}
          data-testid="project-video"
          id={projectVideoElementId(project.id)}
          loop
          muted
          playsInline
          poster={project.image}
          preload="metadata"
          ref={videoRef}
          src={project.video}
        />
      ) : (
        <img src={project.image} alt="" draggable={false} />
      )}
    </div>
  );
}
