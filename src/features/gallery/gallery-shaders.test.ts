import { describe, expect, it } from "vitest";

import { galleryFragmentShader, galleryVertexShader } from "./gallery-shaders";

describe("gallery shaders", () => {
  it("uses the stronger recorded drag curvature", () => {
    expect(galleryVertexShader).toContain("uVelocity * 28.0");
  });

  it("adds a restrained white wash to the project imagery", () => {
    expect(galleryFragmentShader).toContain("mix(splitColor, vec3(1.0), 0.08)");
  });

  it("keeps every plane alive while combining ambient ripple and top curl", () => {
    expect(galleryVertexShader).toContain("uniform float uTime");
    expect(galleryVertexShader).toContain("uniform float uPhase");
    expect(galleryVertexShader).toContain("uniform float uCurl");
    expect(galleryVertexShader).toContain("ambientWave");
    expect(galleryVertexShader).toContain("curlScale");
    expect(galleryVertexShader).toContain("uCurl * 32.0");
    expect(galleryFragmentShader).not.toContain("topVisibility");
    expect(galleryFragmentShader).not.toContain("topFromScreen");
  });

  it("refracts the image continuously instead of waiting for drag velocity", () => {
    expect(galleryFragmentShader).toContain("uniform float uTime");
    expect(galleryFragmentShader).toContain("idleRefraction");
  });
});
