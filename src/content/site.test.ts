import { describe, expect, it } from "vitest";

import { siteContent } from "./site";

describe("siteContent", () => {
  it("uses an explicit placeholder name", () => {
    expect(siteContent.name).toBe("YOUR NAME");
  });

  it("describes the intended visual creator role", () => {
    expect(siteContent.tagline).toContain("Visual Creator");
  });

  it("does not invent an email address", () => {
    expect(siteContent.email).toBeNull();
  });
});
