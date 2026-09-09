"use client";

/* eslint-disable @next/next/no-img-element -- exact local source assets also back the WebGL texture layer */

import { projects } from "@/content/projects";
import { GalleryCanvas } from "./GalleryCanvas";
import { useDragGallery } from "./useDragGallery";

import "./gallery.css";

const filters = [
  { label: "All", count: 20 },
  { label: "Branding", count: 5 },
  { label: "Digital", count: 20 },
  { label: "Motion", count: 5 },
  { label: "Experiment", count: 6 },
];

export function GalleryPage() {
  const { stageRef, motionRef } = useDragGallery();

  return (
    <main
      className="gallery-stage"
      data-testid="gallery-stage"
      data-dragging="false"
      ref={stageRef}
    >
      <div className="gallery-atmosphere" aria-hidden="true" />

      <header className="gallery-header">
        <div className="gallery-brand">
          unseen studio<sup>®</sup>
        </div>
        <nav className="gallery-nav" aria-label="Primary">
          <span>Index</span>
          <span aria-current="page">Projects</span>
          <span>Contact</span>
          <span className="gallery-menu" aria-label="Menu">
            <img src="/gallery/menu-dots.svg" alt="" />
          </span>
        </nav>
      </header>

      <section className="gallery-filter" aria-label="Project filters">
        <h1>Selected Projects</h1>
        <div className="filter-row">
          {filters.map((filter, index) => (
            <span className={index === 0 ? "active" : ""} key={filter.label}>
              {filter.label}<sup>{filter.count}</sup>
            </span>
          ))}
        </div>
      </section>

      <div className="gallery-viewport">
        <GalleryCanvas motionRef={motionRef} />
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
        </div>
      </div>

      <div className="gallery-top-veil" data-testid="gallery-top-veil" aria-hidden="true" />

      <div className="drag-cue" aria-hidden="true">
        <img src="/gallery/drag-arrows.svg" alt="" />
      </div>
    </main>
  );
}
