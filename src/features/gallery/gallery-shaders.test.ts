import { describe, expect, it } from "vitest";

import { galleryFragmentShader, galleryVertexShader } from "./gallery-shaders";

describe("gallery shaders", () => {
  it("uses the stronger recorded drag curvature", () => {
    expect(galleryVertexShader).toContain("uVelocity * 28.0");
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
    expect(galleryVertexShader).toContain("* 3.4");
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
});
