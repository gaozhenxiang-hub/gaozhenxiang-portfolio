import { describe, expect, it } from "vitest";

import { galleryFragmentShader, galleryVertexShader } from "./gallery-shaders";

describe("gallery shaders", () => {
  it("keeps drag curvature flexible without a large symmetric bow", () => {
    expect(galleryVertexShader).toContain("uVelocity * 12.0");
    expect(galleryVertexShader).toContain("delayedDragWave");
    expect(galleryVertexShader).not.toContain("uVelocity * 28.0");
  });

  it("adds a restrained white wash to the project imagery", () => {
    expect(galleryFragmentShader).toContain("mix(splitColor, vec3(1.0), 0.12)");
  });

  it("keeps every plane alive while combining ambient ripple and depth recession", () => {
    expect(galleryVertexShader).toContain("uniform float uTime");
    expect(galleryVertexShader).toContain("uniform float uPhase");
    expect(galleryVertexShader).toContain("uniform float uRecession");
    expect(galleryFragmentShader).toContain("uniform float uDistanceAlpha");
    expect(galleryVertexShader).toContain("ambientWave");
    expect(galleryVertexShader).toContain("* 3.15");
    expect(galleryVertexShader).toContain("uRecession * 34.0");
    expect(galleryVertexShader).not.toContain("curlScale");
    expect(galleryVertexShader).not.toContain("uCurl");
    expect(galleryFragmentShader).not.toContain("topVisibility");
    expect(galleryFragmentShader).not.toContain("topFromScreen");
    expect(galleryFragmentShader).toContain("alpha * uDistanceAlpha");
  });

  it("refracts the image continuously instead of waiting for drag velocity", () => {
    expect(galleryFragmentShader).toContain("uniform float uTime");
    expect(galleryFragmentShader).toContain("idleRefraction");
    expect(galleryFragmentShader).toContain("0.0008 + min(abs(uVelocity), 1.0) * 0.005");
  });

  it("uses pointer velocity for a transient local image response", () => {
    expect(galleryVertexShader).toContain("uniform vec2 uPointerViewport");
    expect(galleryVertexShader).toContain("uniform float uPointerStrength");
    expect(galleryVertexShader).toContain("pointerImpulse");
    expect(galleryFragmentShader).toContain("uniform vec2 uPointerViewport");
    expect(galleryFragmentShader).toContain("pointerFlow");
    expect(galleryFragmentShader).toContain("pointerChromatic");
    expect(galleryFragmentShader).toContain("splitOffset");
    expect(galleryVertexShader).toContain("pointerImpulse * 22.0");
    expect(galleryFragmentShader).toContain("pointerFlow * 0.014");
    expect(galleryFragmentShader).toContain("pointerImpulse * 0.009");
  });

  it("uses layered phase-offset waves instead of one symmetric bow", () => {
    expect(galleryVertexShader).toContain("diagonalWave");
    expect(galleryVertexShader).toContain("edgeLag");
    expect(galleryVertexShader).toContain("twistWave");
  });

  it("contains no fixed pointer rings, glint, or radial ripple light", () => {
    const pointerShaders = `${galleryVertexShader}\n${galleryFragmentShader}`;
    expect(pointerShaders).not.toContain("pointerRing");
    expect(pointerShaders).not.toContain("ringA");
    expect(pointerShaders).not.toContain("ringB");
    expect(pointerShaders).not.toContain("liquidRipple");
    expect(pointerShaders).not.toContain("pointerGlint");
    expect(pointerShaders).not.toContain("ringHighlight");
    expect(pointerShaders).not.toMatch(/sin\(pointerDistance/);
  });
});
