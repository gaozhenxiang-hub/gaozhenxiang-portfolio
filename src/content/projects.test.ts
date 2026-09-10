import { describe, expect, it } from "vitest";

import { projects } from "./projects";

const approvedImageProjectCopy = [
  ["hubtown", "Blue Portal", "Digital Dreamscape", "/gallery/hubtown.webp"],
  ["poly", "Creative Desk", "Digital Workspace", "/gallery/poly.webp"],
  ["oceanx", "Blue Planet", "Planetary Vision", "/gallery/oceanx.webp"],
  [
    "symphony-of-vines",
    "Liquid Lines",
    "Generative Motion",
    "/gallery/symphony-of-vines.webp",
  ],
  ["klook", "Dream Journey", "Travel Experience", "/gallery/klook.webp"],
  [
    "rspca-animal-futures",
    "Green Future",
    "Eco City Concept",
    "/gallery/rspca-animal-futures.webp",
  ],
  ["blueyard", "Future Screen", "Digital Interface", "/gallery/blueyard.webp"],
  ["cosmos", "Dark Cosmos", "Immersive Space", "/gallery/cosmos.webp"],
  ["25-residences", "Modern Living", "Interior Showcase", "/gallery/25-residences.webp"],
  ["organimo", "Digital Reef", "Surreal Webscape", "/gallery/organimo.webp"],
  [
    "hiring-calculator",
    "Future Device",
    "Product Concept",
    "/gallery/hiring-calculator.webp",
  ],
  ["robco", "Crystal Machine", "Technology Motion", "/gallery/robco.webp"],
];

describe("projects", () => {
  it("provides twenty-four local, replaceable gallery entries", () => {
    expect(projects).toHaveLength(24);
    expect(projects.every((project) => project.image.startsWith("/gallery/"))).toBe(true);
    expect(new Set(projects.map((project) => project.id)).size).toBe(24);
  });

  it("keeps all visible project copy in English", () => {
    expect(projects.every((project) => /^[\x00-\x7F]+$/.test(project.title))).toBe(true);
    expect(projects.every((project) => /^[\x00-\x7F]+$/.test(project.description))).toBe(true);
  });

  it("does not show sequence numbers at the end of project titles", () => {
    expect(projects.every((project) => !/\s\d{2}$/.test(project.title))).toBe(true);
  });

  it("uses the approved content-based copy for the first twelve image projects", () => {
    expect(
      projects.slice(0, 12).map(({ id, title, description, image }) => [
        id,
        title,
        description,
        image,
      ]),
    ).toEqual(approvedImageProjectCopy);
    expect(projects.slice(0, 12).every((project) => project.video === undefined)).toBe(true);
  });

  it("uses the approved copy and local media for the twelve video projects", () => {
    expect(projects.slice(12).map(({ title, description }) => [title, description])).toEqual([
      ["Cinematic Study", "AI Live-Action Film"],
      ["Cinematic Study", "AI Live-Action Film"],
      ["Commercial Study", "AI Advertising Film"],
      ["Commercial Study", "AI Advertising Film"],
      ["Game Cinematic", "AI Game CG"],
      ["Cold Blue", "Game Promotional Film"],
      ["Final Strike", "Fantasy Action Film"],
      ["AI Hallucination", "Paper Collage Film"],
      ["Midnight Line", "Title Sequence"],
      ["Urban Fault", "Game Promotional Film"],
      ["Cinematic Study", "AI Live-Action Film"],
      ["Comic Drama Study", "AI Comic Drama"],
    ]);
    expect(
      projects.slice(12).every((project) => project.video?.startsWith("/gallery/videos/")),
    ).toBe(true);
    expect(
      projects.slice(12).every((project) => project.image.startsWith("/gallery/videos/")),
    ).toBe(true);
  });
});
