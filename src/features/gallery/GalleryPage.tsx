"use client";

/* eslint-disable @next/next/no-img-element -- exact local source assets also back the WebGL texture layer */

import { projects } from "@/content/projects";
import { ContactFinale } from "@/features/contact/ContactFinale";
import { GalleryCanvas } from "./GalleryCanvas";
import { useDragGallery } from "./useDragGallery";

import "./gallery.css";

export function GalleryPage() {
  const { stageRef, motionRef, pointerRef } = useDragGallery();

  return (
    <main
      className="gallery-stage"
      data-testid="gallery-stage"
      data-dragging="false"
      data-pointer-active="false"
      ref={stageRef}
    >
      <div className="gallery-atmosphere" aria-hidden="true" />

      <section className="gallery-filter" aria-label="Project filters">
        <h1>Selected Projects</h1>
      </section>

      <div className="gallery-viewport">
        <GalleryCanvas motionRef={motionRef} pointerRef={pointerRef} />
        <div className="gallery-grid gallery-grid--metadata">
          {projects.map((project) => (
            <article className="project-card" data-testid="project-card" key={project.id}>
              <div className="project-media project-media--fallback">
                <img src={project.image} alt="" draggable={false} />
              </div>
              <div className="project-meta">
                <div>
                  <strong>{project.title}</strong>
                  <span>{project.description}</span>
                </div>
                <img className="project-arrow" src="/gallery/arrow.svg" alt="" />
              </div>
            </article>
          ))}
          <ContactFinale />
        </div>
      </div>

      <div className="gallery-top-veil" data-testid="gallery-top-veil" aria-hidden="true" />

      <div className="drag-cue" aria-hidden="true">
        <img src="/gallery/drag-arrows.svg" alt="" />
      </div>
    </main>
  );
}
