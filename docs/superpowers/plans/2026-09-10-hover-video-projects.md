# Hover Video Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the first twelve image projects unchanged and replace positions 13 through 22 with ten muted, looping, hover-controlled WebGL video previews.

**Architecture:** Extend each project with an optional video path while keeping its image path as the idle poster. The metadata card owns hover state and a real DOM video decoder; the matching Three.js plane creates a `VideoTexture` from that element and swaps the shader texture only while the card is active.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, React Three Fiber, Vitest, Testing Library, Playwright, FFmpeg.

---

## File structure

- `public/gallery/videos/*.mp4`: optimized web copies of the ten user videos.
- `public/gallery/videos/*.webp`: idle posters generated from the matching web videos.
- `src/content/projects.ts`: approved project order, English copy, poster paths, and optional video paths.
- `src/content/projects.test.ts`: regression lock for the unchanged first twelve projects and exact checks for the ten video projects.
- `src/features/gallery/video-preview.ts`: small, testable playback and stable DOM-id helpers.
- `src/features/gallery/video-preview.test.ts`: muted play, loop, pause/reset, and texture-selection tests.
- `src/features/gallery/ProjectMedia.tsx`: DOM image/video fallback and pointer entry/exit surface.
- `src/features/gallery/GalleryPage.tsx`: owns the single active project id.
- `src/features/gallery/GalleryCanvas.tsx`: forwards active state to each WebGL plane.
- `src/features/gallery/ProjectPlane.tsx`: creates/disposes `VideoTexture` and swaps `uTexture`.
- `src/features/gallery/gallery.css`: enables hover hit testing without changing geometry.
- `src/features/gallery/GalleryPage.test.tsx`: component-level playback and single-active-card behavior.
- `e2e/gallery.spec.ts`: real Chrome/Edge playback behavior.
- `e2e/visual-capture.spec.ts`: idle and active video-row visual captures.
- `design-qa.md`: final evidence and visual review.

### Task 1: Prepare web video assets without touching sources

**Files:**
- Create: `public/gallery/videos/cinematic-study-01.mp4`
- Create: `public/gallery/videos/cinematic-study-01.webp`
- Create: `public/gallery/videos/cinematic-study-02.mp4`
- Create: `public/gallery/videos/cinematic-study-02.webp`
- Create: `public/gallery/videos/commercial-study-01.mp4`
- Create: `public/gallery/videos/commercial-study-01.webp`
- Create: `public/gallery/videos/commercial-study-02.mp4`
- Create: `public/gallery/videos/commercial-study-02.webp`
- Create: `public/gallery/videos/game-cinematic-01.mp4`
- Create: `public/gallery/videos/game-cinematic-01.webp`
- Create: `public/gallery/videos/cold-blue.mp4`
- Create: `public/gallery/videos/cold-blue.webp`
- Create: `public/gallery/videos/final-strike.mp4`
- Create: `public/gallery/videos/final-strike.webp`
- Create: `public/gallery/videos/ai-hallucination.mp4`
- Create: `public/gallery/videos/ai-hallucination.webp`
- Create: `public/gallery/videos/midnight-line.mp4`
- Create: `public/gallery/videos/midnight-line.webp`
- Create: `public/gallery/videos/urban-fault.mp4`
- Create: `public/gallery/videos/urban-fault.webp`

- [ ] **Step 1: Create the exact source-to-output map**

Use the following PowerShell values in the worktree. They preserve the approved order and cap only high-frame-rate sources:

```powershell
$videoJobs = @(
  @{ Source='D:\真人电影-简单4.mp4'; Slug='cinematic-study-01'; Fps=24 },
  @{ Source='D:\真人电影-简单3 (1).mp4'; Slug='cinematic-study-02'; Fps=30 },
  @{ Source='D:\广告-困难3.mp4'; Slug='commercial-study-01'; Fps=30 },
  @{ Source='D:\广告-简单3.mp4'; Slug='commercial-study-02'; Fps=30 },
  @{ Source='D:\游戏CG-困难1.mp4'; Slug='game-cinematic-01'; Fps=30 },
  @{ Source='D:\桌面\作品集\冷蓝游戏宣传PV - 副本.mp4'; Slug='cold-blue'; Fps=24 },
  @{ Source='D:\桌面\作品集\年轻剑士与黑甲骑士最终斩击_2K_60fps - 副本.mp4'; Slug='final-strike'; Fps=30 },
  @{ Source='D:\桌面\作品集\AI幻觉纸拼贴最终成片-15秒-2K-48fps.mp4'; Slug='ai-hallucination'; Fps=30 },
  @{ Source='D:\桌面\作品集\midnight-line-final-title-sequence.mp4'; Slug='midnight-line'; Fps=24 },
  @{ Source='D:\桌面\作品集\都市断层游戏PV.mp4'; Slug='urban-fault'; Fps=24 }
)
```

- [ ] **Step 2: Encode optimized copies**

Create `public/gallery/videos`, then run this exact loop with the discovered FFmpeg binary:

```powershell
$ffmpeg = (Get-Command ffmpeg).Source
$videoDir = Join-Path (Get-Location) 'public\gallery\videos'
New-Item -ItemType Directory -Force -Path $videoDir | Out-Null
foreach ($job in $videoJobs) {
  $target = Join-Path $videoDir ($job.Slug + '.mp4')
  & $ffmpeg -y -i $job.Source -vf "scale=w='min(1280,iw)':h=-2" -r $job.Fps `
    -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -movflags +faststart `
    -c:a aac -b:a 96k $target
  if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed for $($job.Slug)" }
}
```

Expected: ten MP4 files, each no wider than 1280 pixels, no more than 30 fps, H.264/yuv420p, and with the same duration and aspect ratio as its source.

- [ ] **Step 3: Generate matching idle posters**

```powershell
foreach ($job in $videoJobs) {
  $source = Join-Path $videoDir ($job.Slug + '.mp4')
  $poster = Join-Path $videoDir ($job.Slug + '.webp')
  & $ffmpeg -y -ss 0 -i $source -frames:v 1 -c:v libwebp -quality 84 $poster
  if ($LASTEXITCODE -ne 0) { throw "Poster generation failed for $($job.Slug)" }
}
```

Expected: ten readable WebP files with the same dimensions as their matching web videos.

- [ ] **Step 4: Verify all generated media**

Run FFprobe across all MP4 files and `Get-Item` across all MP4/WebP files. Confirm ten videos, ten posters, H.264, `yuv420p`, width `<= 1280`, frame rate `<= 30`, non-zero duration, and non-zero file size.

### Task 2: Replace only project positions 13 through 22

**Files:**
- Modify: `src/content/projects.test.ts`
- Modify: `src/content/projects.ts`

- [ ] **Step 1: Write the failing content regression tests**

Add an exact first-twelve snapshot and exact later-project expectations:

```ts
const originalFirstTwelve = [
  ["hubtown", "Hubtown", "Portfolio Website, Immersive Experience", "/gallery/hubtown.webp"],
  ["poly", "Poly", "Website Design", "/gallery/poly.webp"],
  ["oceanx", "OceanX", "A Year of Discovery", "/gallery/oceanx.webp"],
  ["symphony-of-vines", "The Symphony Of Vines", "Interactive Cinematic Experience", "/gallery/symphony-of-vines.webp"],
  ["klook", "Klook", "Interactive Quiz", "/gallery/klook.webp"],
  ["rspca-animal-futures", "RSPCA Animal Futures", "Interactive Learning Experience", "/gallery/rspca-animal-futures.webp"],
  ["blueyard", "BlueYard", "Portfolio Website", "/gallery/blueyard.webp"],
  ["cosmos", "Cosmos", "Marketing Website", "/gallery/cosmos.webp"],
  ["25-residences", "25 Residences", "Portfolio Website", "/gallery/25-residences.webp"],
  ["organimo", "Organimo", "Digital", "/gallery/organimo.webp"],
  ["hiring-calculator", "Hiring Calculator", "Gamified Digital Experience", "/gallery/hiring-calculator.webp"],
  ["robco", "RobCo", "3D Motion", "/gallery/robco.webp"],
];

expect(projects.slice(0, 12).map(({ id, title, description, image }) => [id, title, description, image]))
  .toEqual(originalFirstTwelve);
expect(projects.slice(0, 12).every((project) => project.video === undefined)).toBe(true);

expect(projects.slice(12).map(({ title, description }) => [title, description])).toEqual([
  ["Cinematic Study 01", "AI Live-Action Film"],
  ["Cinematic Study 02", "AI Live-Action Film"],
  ["Commercial Study 01", "AI Advertising Film"],
  ["Commercial Study 02", "AI Advertising Film"],
  ["Game Cinematic 01", "AI Game CG"],
  ["Cold Blue", "Game Promotional Film"],
  ["Final Strike", "Fantasy Action Film"],
  ["AI Hallucination", "Paper Collage Film"],
  ["Midnight Line", "Title Sequence"],
  ["Urban Fault", "Game Promotional Film"],
]);
expect(projects.slice(12).every((project) => project.video?.startsWith("/gallery/videos/"))).toBe(true);
expect(projects.slice(12).every((project) => project.image.startsWith("/gallery/videos/"))).toBe(true);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/content/projects.test.ts`

Expected: FAIL because `Project` has no `video` property and positions 13 through 22 still contain `Visual Study` placeholders.

- [ ] **Step 3: Add the minimal project model and approved records**

Add `video?: string` to `Project`. Replace only array entries 13 through 22 using stable ids and matching `.webp`/`.mp4` paths. For example, position 13 becomes:

```ts
{
  id: "cinematic-study-01",
  title: "Cinematic Study 01",
  description: "AI Live-Action Film",
  category: "Motion",
  image: "/gallery/videos/cinematic-study-01.webp",
  video: "/gallery/videos/cinematic-study-01.mp4",
}
```

Repeat the exact approved table from the design spec for positions 14 through 22; use `Motion` for every video project because categories are no longer displayed and all ten are moving-image work.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/content/projects.test.ts`

Expected: all project content tests pass with 22 unique ids, unchanged first twelve entries, and ten video entries.

- [ ] **Step 5: Commit the content and prepared assets**

```powershell
git add public/gallery/videos src/content/projects.ts src/content/projects.test.ts
git commit -m "feat: add portfolio video assets"
```

### Task 3: Add a testable hover playback controller

**Files:**
- Create: `src/features/gallery/video-preview.test.ts`
- Create: `src/features/gallery/video-preview.ts`

- [ ] **Step 1: Write failing playback and selection tests**

```ts
import { describe, expect, it, vi } from "vitest";
import { projectVideoElementId, selectProjectTexture, setVideoPreviewState } from "./video-preview";

describe("video preview", () => {
  it("starts muted looping playback while active", async () => {
    const video = {
      muted: false,
      loop: false,
      playsInline: false,
      currentTime: 4,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
    };
    await setVideoPreviewState(video, true);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video.play).toHaveBeenCalledOnce();
    expect(video.pause).not.toHaveBeenCalled();
  });

  it("pauses and resets after pointer exit", async () => {
    const video = {
      muted: true,
      loop: true,
      playsInline: true,
      currentTime: 4,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
    };
    await setVideoPreviewState(video, false);
    expect(video.pause).toHaveBeenCalledOnce();
    expect(video.currentTime).toBe(0);
    expect(video.play).not.toHaveBeenCalled();
  });

  it("keeps the poster unless an active video texture exists", () => {
    expect(selectProjectTexture("poster", null, true)).toBe("poster");
    expect(selectProjectTexture("poster", "video", false)).toBe("poster");
    expect(selectProjectTexture("poster", "video", true)).toBe("video");
    expect(projectVideoElementId("cold-blue")).toBe("project-video-cold-blue");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/gallery/video-preview.test.ts`

Expected: FAIL because `video-preview.ts` does not exist.

- [ ] **Step 3: Implement only the tested helpers**

```ts
export type PreviewVideo = Pick<
  HTMLVideoElement,
  "currentTime" | "loop" | "muted" | "pause" | "play" | "playsInline"
>;

export function projectVideoElementId(projectId: string) {
  return `project-video-${projectId}`;
}

export function selectProjectTexture<T>(poster: T, video: T | null, active: boolean) {
  return active && video ? video : poster;
}

export async function setVideoPreviewState(video: PreviewVideo, active: boolean) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  if (active) {
    try {
      await video.play();
    } catch {
      return false;
    }
    return true;
  }
  video.pause();
  video.currentTime = 0;
  return false;
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/features/gallery/video-preview.test.ts`

Expected: all three tests pass.

### Task 4: Render one active DOM preview and preserve drag behavior

**Files:**
- Create: `src/features/gallery/ProjectMedia.tsx`
- Modify: `src/features/gallery/GalleryPage.test.tsx`
- Modify: `src/features/gallery/GalleryPage.tsx`
- Modify: `src/features/gallery/gallery.css`
- Modify: `e2e/gallery.spec.ts`

- [ ] **Step 1: Write failing component assertions**

In `GalleryPage.test.tsx`, spy on media playback and assert ten videos, no video in the first card, the approved title, and exclusive hover state:

```tsx
const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
render(<GalleryPage />);

const cards = screen.getAllByTestId("project-card");
expect(screen.getAllByTestId("project-video")).toHaveLength(10);
expect(cards[0].querySelector("video")).toBeNull();
expect(screen.getByText("Cinematic Study 01")).toBeVisible();

fireEvent.pointerEnter(cards[12].querySelector(".project-media")!);
await waitFor(() => expect(cards[12]).toHaveAttribute("data-preview", "playing"));
expect(play).toHaveBeenCalledTimes(1);

fireEvent.pointerEnter(cards[13].querySelector(".project-media")!);
await waitFor(() => expect(cards[13]).toHaveAttribute("data-preview", "playing"));
expect(cards[12]).toHaveAttribute("data-preview", "idle");
expect(pause).toHaveBeenCalled();

fireEvent.pointerLeave(cards[13].querySelector(".project-media")!);
await waitFor(() => expect(cards[13]).toHaveAttribute("data-preview", "idle"));
```

Also add the real-browser test before implementation:

```ts
test("later projects play muted on hover and reset on exit", async ({ page }) => {
  await page.goto("/");
  const card = page.getByTestId("project-card").nth(12);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const box = await card.boundingBox();
    if (box && box.y > 160 && box.y < 650) break;
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(220);
  }
  const media = card.locator(".project-media");
  const mediaBox = await media.boundingBox();
  expect(mediaBox).not.toBeNull();
  await page.mouse.move(mediaBox!.x + mediaBox!.width / 2, mediaBox!.y + mediaBox!.height / 2);
  const video = card.locator("video");
  await expect.poll(() => video.evaluate((node) => ({ paused: node.paused, muted: node.muted, loop: node.loop })))
    .toEqual({ paused: false, muted: true, loop: true });
  const startedAt = await video.evaluate((node) => node.currentTime);
  await page.waitForTimeout(450);
  expect(await video.evaluate((node) => node.currentTime)).toBeGreaterThan(startedAt);
  await page.mouse.move(12, 12);
  await expect.poll(() => video.evaluate((node) => ({ paused: node.paused, time: node.currentTime })))
    .toEqual({ paused: true, time: 0 });
});
```

- [ ] **Step 2: Run the component and browser tests and verify RED**

Run: `npm test -- src/features/gallery/GalleryPage.test.tsx`

Run: `npx playwright test e2e/gallery.spec.ts --project=chrome-1440 --grep "play muted"`

Expected: both FAIL because no video elements or hover-preview state exist.

- [ ] **Step 3: Create `ProjectMedia`**

Render the unchanged `<img>` branch when `project.video` is absent. For video projects, render a `<video>` with `id={projectVideoElementId(project.id)}`, `src={project.video}`, `poster={project.image}`, `muted`, `loop`, `playsInline`, `preload="metadata"`, `aria-label={`${project.title} preview`}`, and `data-testid="project-video"`. Use an effect to call `setVideoPreviewState(videoRef.current, active)` whenever `active` changes. The wrapper calls `onActivate(project.id)` on pointer enter and `onDeactivate(project.id)` on pointer leave.

- [ ] **Step 4: Own exclusive active state in `GalleryPage`**

Add:

```tsx
const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
const deactivateProject = (projectId: string) => {
  setActiveProjectId((current) => (current === projectId ? null : current));
};
```

Pass `activeProjectId` to `GalleryCanvas`. Replace the inline media markup with `ProjectMedia`, and set each article's `data-preview` to `playing` or `idle`.

- [ ] **Step 5: Restore pointer hit testing without changing layout**

Keep `.gallery-grid { pointer-events: none; }`, add `pointer-events: auto` only to `.project-media`, and apply the existing image sizing/filter rules to both `.project-media img` and `.project-media video`. Do not change dimensions, gaps, radius, brightness, or metadata spacing.

- [ ] **Step 6: Run the component tests and verify GREEN**

Run: `npm test -- src/features/gallery/GalleryPage.test.tsx`

Expected: every GalleryPage test passes, including ten videos and one active card.

### Task 5: Feed the playing video into the existing shader

**Files:**
- Modify: `src/features/gallery/GalleryCanvas.tsx`
- Modify: `src/features/gallery/ProjectPlane.tsx`

- [ ] **Step 1: Add the active id to the canvas API**

Change `GalleryCanvas` and `GalleryScene` to accept `activeProjectId: string | null`. Pass `isActive={activeProjectId === project.id}` to every `ProjectPlane`.

- [ ] **Step 2: Create and dispose a `VideoTexture` for video projects**

In `ProjectPlane`, import `VideoTexture`, `projectVideoElementId`, and `selectProjectTexture`. Add `isActive` to props and add `const videoTextureRef = useRef<VideoTexture | null>(null)`. After mount, if `project.video` exists, find the matching DOM video element, construct one `VideoTexture`, set `SRGBColorSpace` and linear filters, store it in the ref, and dispose it during cleanup:

```tsx
useEffect(() => {
  if (!project.video) return;
  const video = document.getElementById(projectVideoElementId(project.id));
  if (!(video instanceof HTMLVideoElement)) return;
  const texture = new VideoTexture(video);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  videoTextureRef.current = texture;
  return () => {
    videoTextureRef.current = null;
    texture.dispose();
  };
}, [project.id, project.video]);
```

- [ ] **Step 3: Swap only the shader texture uniform**

Keep all existing geometry, motion, pointer, depth, and shader values untouched. At the beginning of the existing `useFrame` callback, set:

```tsx
materialRef.current.uniforms.uTexture.value = selectProjectTexture(
  displayTexture,
  videoTextureRef.current,
  isActive,
);
```

The poster remains selected until the video texture exists. No other uniform changes.

- [ ] **Step 4: Run unit tests, lint, and build**

Run: `npm test && npm run lint && npm run build`

Expected: all unit/component tests pass, lint exits without errors, and the production build exits `0`.

- [ ] **Step 5: Commit playback and WebGL integration**

```powershell
git add src/features/gallery
git commit -m "feat: play project videos on hover"
```

### Task 6: Prove playback in Chrome and Edge and complete visual QA

**Files:**
- Modify: `e2e/gallery.spec.ts`
- Modify: `e2e/visual-capture.spec.ts`
- Modify: `design-qa.md`

- [ ] **Step 1: Run the real-browser playback test after implementation**

Run: `npx playwright test e2e/gallery.spec.ts --project=chrome-1440 --project=edge-1080p --grep "play muted"`

Expected GREEN: both Chrome and Edge pass; playback advances while hovered and returns to exactly zero after exit.

- [ ] **Step 2: Add idle and active visual captures**

In `e2e/visual-capture.spec.ts`, add an opt-in capture that reaches card 13, waits with the pointer outside, captures `gallery-video-idle-${testInfo.project.name}.png`, hovers for at least 500 ms, then captures `gallery-video-active-${testInfo.project.name}.png`.

- [ ] **Step 3: Run the complete automated gate**

Run: `npm run lint && npm test && npm run build`

Expected: lint has no errors, all Vitest tests pass, and the production build exits `0`.

Run: `npx playwright test e2e/gallery.spec.ts --project=chrome-1440 --project=edge-1080p --project=chrome-recording-reference`

Expected: every desktop interaction test passes across Chrome and Edge projects.

- [ ] **Step 4: Capture and compare the final visual states**

Run:

```powershell
$env:CAPTURE_QA='1'
try {
  npx playwright test e2e/visual-capture.spec.ts --project=chrome-1440 --project=edge-1080p --project=chrome-recording-reference
  exit $LASTEXITCODE
} finally {
  Remove-Item Env:CAPTURE_QA -ErrorAction SilentlyContinue
}
```

Inspect idle and active rows at the matched reference viewport. Confirm unchanged two-column geometry, brightness, curvature, pointer response, recession, and metadata; confirm the active video texture is visible inside the same curved plane with no black flash or flat DOM overlay.

- [ ] **Step 5: Update QA evidence and commit**

Record asset counts and sizes, unit/build results, Chrome/Edge results, playback state evidence, and visual review in `design-qa.md`. End with `final result: passed` only when there are no remaining P0/P1/P2 issues.

```powershell
git add e2e/gallery.spec.ts e2e/visual-capture.spec.ts design-qa.md docs/superpowers/plans/2026-09-10-hover-video-projects.md
git commit -m "test: verify hover video gallery"
```

## Approved extension: positions 23 and 24

The user subsequently supplied `真人电影-困难1.mp4` and `漫剧-困难1.mp4` and approved adding both after the existing entries. Encode them with the same web profile, generate matching WebP posters, append `Cinematic Study 03 — AI Live-Action Film` and `Comic Drama Study 01 — AI Comic Drama`, and extend the content/component/browser assertions from 22 projects and 10 videos to 24 projects and 12 videos. Preserve every existing project and interaction unchanged.
