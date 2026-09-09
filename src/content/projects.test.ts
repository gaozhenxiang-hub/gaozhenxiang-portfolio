import { describe, expect, it } from "vitest";

import { projects } from "./projects";

describe("projects", () => {
  it("provides twelve local, replaceable gallery entries", () => {
    expect(projects).toHaveLength(12);
    expect(projects.every((project) => project.image.startsWith("/gallery/"))).toBe(true);
    expect(new Set(projects.map((project) => project.id)).size).toBe(12);
  });

  it("keeps all visible project copy in English", () => {
    expect(projects.every((project) => /^[\x00-\x7F]+$/.test(project.title))).toBe(true);
    expect(projects.every((project) => /^[\x00-\x7F]+$/.test(project.description))).toBe(true);
  });
});
