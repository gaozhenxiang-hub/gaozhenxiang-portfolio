import { describe, expect, it } from "vitest";

import { galleryFragmentShader, galleryVertexShader } from "./gallery-shaders";

describe("gallery shaders", () => {
  it("uses the stronger recorded drag curvature", () => {
    expect(galleryVertexShader).toContain("uVelocity * 28.0");
  });

  it("adds a restrained white wash to the project imagery", () => {
    expect(galleryFragmentShader).toContain("mix(splitColor, vec3(1.0), 0.055)");
  });

  it("fades moving project planes before they cross the fixed title", () => {
    expect(galleryFragmentShader).toContain("smoothstep(155.0, 270.0, topFromScreen)");
  });
});
