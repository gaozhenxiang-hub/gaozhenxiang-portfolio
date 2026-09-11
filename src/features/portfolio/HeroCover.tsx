/* eslint-disable @next/next/no-img-element -- the approved generated mock is the exact static fallback */

import type { RefObject } from "react";

import type { PointerInteractionState } from "@/features/gallery/gallery-motion";
import { HeroCanvas } from "./HeroCanvas";

export function HeroCover({
  heroProgressRef,
  pointerRef,
}: {
  heroProgressRef: RefObject<number>;
  pointerRef: RefObject<PointerInteractionState>;
}) {
  return (
    <section className="hero-cover" data-testid="hero-cover" aria-labelledby="hero-title">
      <img
        className="hero-fallback"
        data-testid="hero-fallback"
        src="/hero/aigc-cover-fallback.png"
        alt=""
        aria-hidden="true"
      />
      <HeroCanvas heroProgressRef={heroProgressRef} pointerRef={pointerRef} />
      <div className="hero-copy">
        <p className="hero-role">AIGC CREATOR</p>
        <h1 id="hero-title">高振翔</h1>
      </div>
      <div className="hero-works-cue" aria-hidden="true">
        <span>SELECTED WORKS</span>
        <i />
      </div>
      <div className="hero-scroll-cue" aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
        <i />
      </div>
    </section>
  );
}
