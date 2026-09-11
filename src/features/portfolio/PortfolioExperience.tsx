"use client";

import { GalleryPage } from "@/features/gallery/GalleryPage";
import { HeroCover } from "./HeroCover";
import { usePortfolioMotion } from "./usePortfolioMotion";

import "./portfolio.css";

export function PortfolioExperience() {
  const { stageRef, motionRef, pointerRef, heroProgressRef } = usePortfolioMotion();

  return (
    <main
      className="portfolio-experience"
      data-testid="portfolio-experience"
      data-phase="hero"
      data-dragging="false"
      data-pointer-active="false"
      ref={stageRef}
    >
      <GalleryPage motionRef={motionRef} pointerRef={pointerRef} />
      <HeroCover heroProgressRef={heroProgressRef} pointerRef={pointerRef} />
    </main>
  );
}
