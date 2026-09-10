import { describe, expect, it } from "vitest";

import { projects } from "./projects";

const originalFirstTwelve = [
  ["hubtown", "Hubtown", "Portfolio Website, Immersive Experience", "/gallery/hubtown.webp"],
  ["poly", "Poly", "Website Design", "/gallery/poly.webp"],
  ["oceanx", "OceanX", "A Year of Discovery", "/gallery/oceanx.webp"],
  [
    "symphony-of-vines",
    "The Symphony Of Vines",
    "Interactive Cinematic Experience",
    "/gallery/symphony-of-vines.webp",
  ],
  ["klook", "Klook", "Interactive Quiz", "/gallery/klook.webp"],
  [
    "rspca-animal-futures",
    "RSPCA Animal Futures",
    "Interactive Learning Experience",
    "/gallery/rspca-animal-futures.webp",
  ],
  ["blueyard", "BlueYard", "Portfolio Website", "/gallery/blueyard.webp"],
  ["cosmos", "Cosmos", "Marketing Website", "/gallery/cosmos.webp"],
  ["25-residences", "25 Residences", "Portfolio Website", "/gallery/25-residences.webp"],
  ["organimo", "Organimo", "Digital", "/gallery/organimo.webp"],
  [
    "hiring-calculator",
    "Hiring Calculator",
    "Gamified Digital Experience",
    "/gallery/hiring-calculator.webp",
  ],
  ["robco", "RobCo", "3D Motion", "/gallery/robco.webp"],
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

  it("keeps the first twelve image projects unchanged", () => {
    expect(
      projects.slice(0, 12).map(({ id, title, description, image }) => [
        id,
        title,
        description,
        image,
      ]),
    ).toEqual(originalFirstTwelve);
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
