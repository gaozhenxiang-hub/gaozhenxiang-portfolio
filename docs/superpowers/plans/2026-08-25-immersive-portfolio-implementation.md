# 双世界沉浸式个人作品集 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个桌面高画质优先、可滚动推进和鼠标拖动探索的双世界个人作品集：暖白艺术展厅展示 5–7 个视觉作品，深色 3D 隧道沉浸展示其中 2–3 个重点作品。

**Architecture:** 使用 Next.js App Router 承载可访问的 DOM 内容层，React Three Fiber/Three.js 承载暖白背景与深色隧道，GSAP/Lenis 统一滚动和镜头进度。作品、站点信息和媒体全部从强类型配置读取；交互计算、画质策略和 WebGL 能力检测保持为可单测的纯函数，3D 失败时退回同风格 DOM 作品墙。

**Tech Stack:** Next.js、React、TypeScript、React Three Fiber、Drei、Three.js、GSAP、Lenis、Zustand、Vitest、Testing Library、Playwright、ESLint

---

## 文件结构

```text
.
├── docs/superpowers/specs/2026-08-25-immersive-portfolio-design.md
├── docs/superpowers/plans/2026-08-25-immersive-portfolio-implementation.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── vitest.config.ts
├── playwright.config.ts
├── scripts/generate-placeholder-media.mjs
├── public/media/placeholders/
├── src/app/layout.tsx
├── src/app/page.tsx
├── src/app/globals.css
├── src/content/site.ts
├── src/content/projects.ts
├── src/types/project.ts
├── src/lib/quality.ts
├── src/lib/motion.ts
├── src/lib/webgl.ts
├── src/store/experience.ts
├── src/features/shell/ExperienceShell.tsx
├── src/features/shell/GlobalControls.tsx
├── src/features/shell/CustomCursor.tsx
├── src/features/intro/IntroGallery.tsx
├── src/features/intro/WarmGalleryScene.tsx
├── src/features/projects/ProjectWall.tsx
├── src/features/projects/ProjectCard.tsx
├── src/features/portal/PortalTransition.tsx
├── src/features/tunnel/TunnelGallery.tsx
├── src/features/tunnel/TunnelScene.tsx
├── src/features/viewer/ProjectViewer.tsx
├── src/features/fallback/FallbackGallery.tsx
├── src/features/fallback/GraphicsBoundary.tsx
├── src/hooks/useDragParallax.ts
├── src/hooks/useFrameBudget.ts
├── src/hooks/useWebGLSupport.ts
├── src/audio/createAudioEngine.ts
├── src/test/setup.ts
└── e2e/experience.spec.ts
```

每个 feature 目录只拥有自己的表现和交互；`content` 不依赖 UI，`lib` 不依赖 React，`store` 只保存跨模块状态。3D 场景不得直接写入作品文案或媒体路径。

### Task 1: 初始化应用、测试与基础页面

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/content/site.ts`
- Create: `src/content/site.test.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: 安装运行时和测试依赖**

Run:

```powershell
npm init -y
npm install next@latest react@latest react-dom@latest three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing gsap lenis zustand
npm install -D typescript @types/node @types/react @types/react-dom @types/three eslint eslint-config-next vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
npm pkg set scripts.dev="next dev" scripts.build="next build" scripts.start="next start" scripts.lint="eslint ." scripts.test="vitest run" scripts.test:watch="vitest" scripts.test:e2e="playwright test" scripts.check="npm run lint && npm run test && npm run build"
```

Expected: `package.json` contains all scripts and `npm install` exits with code 0.

- [ ] **Step 2: 创建 TypeScript、Next、ESLint、Vitest 与 Playwright 配置**

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", "coverage/**", "playwright-report/**"]),
]);
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(rootDir, "src") } },
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"] },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: { command: "npm run dev", url: "http://127.0.0.1:3000", reuseExistingServer: true },
  projects: [
    { name: "chrome-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "edge-1080p", use: { ...devices["Desktop Edge"], viewport: { width: 1920, height: 1080 } } },
  ],
});
```

- [ ] **Step 3: 先写失败的站点信息测试**

Create `src/content/site.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { siteContent } from "./site";

describe("siteContent", () => {
  it("uses explicit neutral placeholders instead of invented identity data", () => {
    expect(siteContent.name).toBe("YOUR NAME");
    expect(siteContent.tagline).toContain("Visual Creator");
    expect(siteContent.email).toBeNull();
  });
});
```

- [ ] **Step 4: 运行测试并确认失败**

Run: `npm test -- src/content/site.test.ts`

Expected: FAIL because `src/content/site.ts` does not exist.

- [ ] **Step 5: 实现站点配置与基础页面**

Create `src/content/site.ts`:

```ts
export const siteContent = {
  name: "YOUR NAME",
  tagline: "Visual Creator × Vibe Coder",
  email: null as string | null,
  resumeHref: null as string | null,
  socials: [] as Array<{ label: string; href: string }>,
} as const;
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOUR NAME — Visual Creator",
  description: "An immersive visual portfolio.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
```

Create `src/app/page.tsx`:

```tsx
import { siteContent } from "@/content/site";

export default function HomePage() {
  return <main><h1>{siteContent.name}</h1><p>{siteContent.tagline}</p></main>;
}
```

Create `src/app/globals.css`:

```css
:root { color-scheme: light; --warm-white:#efeee9; --ink:#111114; --graphite:#24242a; --silver:#c8cbd2; }
* { box-sizing:border-box; }
html { background:var(--warm-white); scroll-behavior:auto; }
body { margin:0; color:var(--ink); background:var(--warm-white); font-family:Arial,"Noto Sans SC",sans-serif; }
button,a { color:inherit; font:inherit; }
```

- [ ] **Step 6: 验证基础工程**

Run:

```powershell
npm test -- src/content/site.test.ts
npm run lint
npm run build
```

Expected: test PASS, ESLint exits 0, Next build succeeds.

- [ ] **Step 7: 提交**

```powershell
git add package.json package-lock.json next.config.ts tsconfig.json eslint.config.mjs vitest.config.ts playwright.config.ts src
git commit -m "chore: bootstrap immersive portfolio app"
```

### Task 2: 建立作品内容模型与中性占位媒体

**Files:**
- Create: `src/types/project.ts`
- Create: `src/content/projects.ts`
- Create: `src/content/projects.test.ts`
- Create: `scripts/generate-placeholder-media.mjs`
- Create: `public/media/placeholders/work-01.svg` through `work-06.svg`

- [ ] **Step 1: 写失败的内容约束测试**

Create `src/content/projects.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { projects } from "./projects";

describe("projects", () => {
  it("contains 5–7 works and 2–3 featured 3D works", () => {
    expect(projects.length).toBeGreaterThanOrEqual(5);
    expect(projects.length).toBeLessThanOrEqual(7);
    expect(projects.filter((project) => project.featured3d)).toHaveLength(3);
  });

  it("marks all seed content as placeholders", () => {
    expect(projects.every((project) => project.placeholder)).toBe(true);
    expect(projects.every((project) => project.title.startsWith("VISUAL STUDY"))).toBe(true);
  });

  it("uses unique ids and valid accent tuples", () => {
    expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length);
    expect(projects.every((project) => project.accent.length === 3)).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/content/projects.test.ts`

Expected: FAIL because project types and data do not exist.

- [ ] **Step 3: 实现强类型作品配置**

Create `src/types/project.ts`:

```ts
export type MediaKind = "image" | "video";

export type Project = {
  id: string;
  title: string;
  year: string;
  category: "IMAGE" | "VIDEO" | "GENERATIVE" | "VISUAL";
  coverSrc: string;
  previewSrc: string | null;
  fullSrc: string;
  mediaKind: MediaKind;
  featured3d: boolean;
  placeholder: boolean;
  accent: readonly [number, number, number];
  description: string | null;
  href: string | null;
};
```

Create `src/content/projects.ts`:

```ts
import type { Project } from "@/types/project";

const accents = [
  [0.23, 0.72, 0.98], [0.73, 0.34, 0.98], [0.98, 0.43, 0.58],
  [0.42, 0.91, 0.68], [0.98, 0.72, 0.31], [0.48, 0.54, 0.98],
] as const;

export const projects: Project[] = accents.map((accent, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `work-${number}`,
    title: `VISUAL STUDY ${number}`,
    year: "2026",
    category: index % 2 === 0 ? "GENERATIVE" : "VISUAL",
    coverSrc: `/media/placeholders/work-${number}.svg`,
    previewSrc: null,
    fullSrc: `/media/placeholders/work-${number}.svg`,
    mediaKind: "image",
    featured3d: index < 3,
    placeholder: true,
    accent,
    description: null,
    href: null,
  };
});
```

- [ ] **Step 4: 生成明确标记的原创占位封面**

Create `scripts/generate-placeholder-media.mjs`:

```js
import { mkdir, writeFile } from "node:fs/promises";

const colors = ["47b8fa", "ba57fa", "fa6d94", "6be8ad", "fab750", "7a89fa"];
await mkdir("public/media/placeholders", { recursive: true });

await Promise.all(colors.map(async (color, index) => {
  const number = String(index + 1).padStart(2, "0");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
  <defs><filter id="blur"><feGaussianBlur stdDeviation="80"/></filter></defs>
  <rect width="1600" height="1000" fill="#111114"/>
  <circle cx="${350 + index * 120}" cy="420" r="360" fill="#${color}" filter="url(#blur)" opacity=".82"/>
  <path d="M0 740 C420 ${540 + index * 20}, 960 940, 1600 600 V1000 H0Z" fill="#efeee9" opacity=".18"/>
  <text x="80" y="110" fill="#efeee9" font-family="Arial" font-size="42">PLACEHOLDER / VISUAL STUDY ${number}</text>
  </svg>`;
  await writeFile(`public/media/placeholders/work-${number}.svg`, svg, "utf8");
}));
```

Run: `node scripts/generate-placeholder-media.mjs`

Expected: six SVG files are created and each visibly contains `PLACEHOLDER`.

- [ ] **Step 5: 验证并提交**

Run: `npm test -- src/content/projects.test.ts`

Expected: PASS.

```powershell
git add src/types src/content scripts public/media/placeholders
git commit -m "feat: add typed portfolio content model"
```

### Task 3: 实现全局体验状态与高画质策略

**Files:**
- Create: `src/lib/quality.ts`
- Create: `src/lib/quality.test.ts`
- Create: `src/store/experience.ts`
- Create: `src/store/experience.test.ts`

- [ ] **Step 1: 写失败的画质和状态测试**

Create `src/lib/quality.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { classifyFps, resolveQualityPreset } from "./quality";

describe("quality policy", () => {
  it("keeps HIGH as the desktop default", () => {
    expect(resolveQualityPreset("HIGH", { dpr: 2, webgl2: true }).particles).toBe(1800);
  });

  it("reduces expensive effects only after sustained low fps", () => {
    expect(classifyFps([27, 29, 28, 30, 26])).toBe("LITE");
    expect(classifyFps([55, 58, 60, 57, 59])).toBe("HIGH");
  });
});
```

Create `src/store/experience.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { useExperienceStore } from "./experience";

describe("experience store", () => {
  beforeEach(() => useExperienceStore.setState(useExperienceStore.getInitialState()));

  it("starts high quality and muted", () => {
    expect(useExperienceStore.getState()).toMatchObject({ qualityMode: "HIGH", muted: true, selectedProjectId: null });
  });

  it("opens and closes a project", () => {
    useExperienceStore.getState().openProject("work-01");
    expect(useExperienceStore.getState().selectedProjectId).toBe("work-01");
    useExperienceStore.getState().closeProject();
    expect(useExperienceStore.getState().selectedProjectId).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/lib/quality.test.ts src/store/experience.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: 实现画质纯函数**

Create `src/lib/quality.ts`:

```ts
export type QualityMode = "HIGH" | "AUTO" | "LITE";
export type ResolvedQuality = { dpr: number; particles: number; shadows: boolean; postprocessing: boolean };

export function classifyFps(samples: number[]): "HIGH" | "LITE" {
  const average = samples.reduce((sum, value) => sum + value, 0) / Math.max(samples.length, 1);
  return average < 36 ? "LITE" : "HIGH";
}

export function resolveQualityPreset(mode: QualityMode, caps: { dpr: number; webgl2: boolean }): ResolvedQuality {
  const lite = { dpr: Math.min(caps.dpr, 1.15), particles: 420, shadows: false, postprocessing: false };
  if (mode === "LITE" || !caps.webgl2) return lite;
  return { dpr: Math.min(caps.dpr, 2), particles: 1800, shadows: true, postprocessing: true };
}
```

- [ ] **Step 4: 实现跨模块状态**

Create `src/store/experience.ts`:

```ts
import { create } from "zustand";
import type { QualityMode } from "@/lib/quality";

export type ExperiencePhase = "INTRO" | "WALL" | "PORTAL" | "TUNNEL" | "OUTRO";
type ExperienceState = {
  phase: ExperiencePhase;
  qualityMode: QualityMode;
  muted: boolean;
  selectedProjectId: string | null;
  setPhase: (phase: ExperiencePhase) => void;
  setQualityMode: (mode: QualityMode) => void;
  toggleMuted: () => void;
  openProject: (id: string) => void;
  closeProject: () => void;
};

export const useExperienceStore = create<ExperienceState>((set) => ({
  phase: "INTRO",
  qualityMode: "HIGH",
  muted: true,
  selectedProjectId: null,
  setPhase: (phase) => set({ phase }),
  setQualityMode: (qualityMode) => set({ qualityMode }),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
  openProject: (selectedProjectId) => set({ selectedProjectId }),
  closeProject: () => set({ selectedProjectId: null }),
}));
```

- [ ] **Step 5: 验证并提交**

Run: `npm test -- src/lib/quality.test.ts src/store/experience.test.ts`

Expected: PASS.

```powershell
git add src/lib/quality.ts src/lib/quality.test.ts src/store
git commit -m "feat: add experience state and quality policy"
```

### Task 4: 建立拖动惯性与滚动映射

**Files:**
- Create: `src/lib/motion.ts`
- Create: `src/lib/motion.test.ts`
- Create: `src/hooks/useDragParallax.ts`

- [ ] **Step 1: 写失败的运动数学测试**

Create `src/lib/motion.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { clamp, dragDistance, integrateInertia, normalizeScroll } from "./motion";

describe("motion math", () => {
  it("distinguishes a click from a drag at six pixels", () => {
    expect(dragDistance({ x: 10, y: 10 }, { x: 14, y: 13 })).toBeLessThan(6);
    expect(dragDistance({ x: 10, y: 10 }, { x: 20, y: 13 })).toBeGreaterThan(6);
  });

  it("clamps camera drag and decays inertia", () => {
    expect(clamp(2, -1, 1)).toBe(1);
    expect(integrateInertia(1, 0.8)).toBeCloseTo(0.8);
  });

  it("normalizes scroll into a reversible zero-to-one range", () => {
    expect(normalizeScroll(150, 100, 300)).toBeCloseTo(0.25);
    expect(normalizeScroll(50, 100, 300)).toBe(0);
    expect(normalizeScroll(500, 100, 300)).toBe(1);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/lib/motion.test.ts`

Expected: FAIL because motion helpers do not exist.

- [ ] **Step 3: 实现纯运动函数**

Create `src/lib/motion.ts`:

```ts
export type Point = { x: number; y: number };
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const dragDistance = (start: Point, end: Point) => Math.hypot(end.x - start.x, end.y - start.y);
export const integrateInertia = (velocity: number, friction = 0.88) => Math.abs(velocity) < 0.001 ? 0 : velocity * friction;
export const normalizeScroll = (position: number, start: number, length: number) => clamp((position - start) / Math.max(length, 1), 0, 1);
```

- [ ] **Step 4: 实现可复用拖动 Hook**

Create `src/hooks/useDragParallax.ts`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, dragDistance, integrateInertia, type Point } from "@/lib/motion";

export function useDragParallax(limit = 1, capturePointer = true) {
  const start = useRef<Point | null>(null);
  const last = useRef<Point | null>(null);
  const velocity = useRef<Point>({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);

  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("[data-no-drag]")) return;
    start.current = { x: event.clientX, y: event.clientY };
    last.current = start.current;
    moved.current = false;
    setDragging(true);
    if (capturePointer) event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!last.current || !start.current) return;
    const point = { x: event.clientX, y: event.clientY };
    moved.current ||= dragDistance(start.current, point) >= 6;
    const dx = (point.x - last.current.x) / window.innerWidth;
    const dy = (point.y - last.current.y) / window.innerHeight;
    velocity.current = { x: dx, y: dy };
    setOffset((current) => ({ x: clamp(current.x + dx, -limit, limit), y: clamp(current.y + dy, -limit, limit) }));
    last.current = point;
  };

  const onPointerUp = () => {
    setDragging(false);
    start.current = null;
    last.current = null;
    const coast = () => {
      velocity.current = { x: integrateInertia(velocity.current.x), y: integrateInertia(velocity.current.y) };
      setOffset((current) => ({ x: clamp(current.x + velocity.current.x, -limit, limit), y: clamp(current.y + velocity.current.y, -limit, limit) }));
      if (velocity.current.x || velocity.current.y) frame.current = requestAnimationFrame(coast);
    };
    frame.current = requestAnimationFrame(coast);
  };

  return { offset, dragging, didDrag: () => moved.current, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
}
```

- [ ] **Step 5: 验证并提交**

Run: `npm test -- src/lib/motion.test.ts`

Expected: PASS.

```powershell
git add src/lib/motion.ts src/lib/motion.test.ts src/hooks/useDragParallax.ts
git commit -m "feat: add drag inertia and scroll mapping"
```

### Task 5: 实现暖白开场与程序化 3D 背景

**Files:**
- Create: `src/features/intro/warmSceneLayout.ts`
- Create: `src/features/intro/warmSceneLayout.test.ts`
- Create: `src/features/intro/WarmGalleryScene.tsx`
- Create: `src/features/intro/IntroGallery.tsx`
- Create: `src/features/intro/intro-gallery.css`

- [ ] **Step 1: 写失败的场景布局测试**

Create `src/features/intro/warmSceneLayout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getWarmSceneLayout } from "./warmSceneLayout";

describe("warm gallery scene", () => {
  it("keeps decorative arches outside the central reading column", () => {
    const layout = getWarmSceneLayout();
    expect(layout.arches.every((arch) => Math.abs(arch.x) >= 3.2)).toBe(true);
    expect(layout.fragments).toHaveLength(12);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/features/intro/warmSceneLayout.test.ts`

Expected: FAIL because layout helper does not exist.

- [ ] **Step 3: 实现场景布局数据**

Create `src/features/intro/warmSceneLayout.ts`:

```ts
export function getWarmSceneLayout() {
  return {
    arches: [{ x: -4.1, y: 0.1, scale: 2.4 }, { x: 4.1, y: -0.2, scale: 2.8 }],
    fragments: Array.from({ length: 12 }, (_, index) => ({
      x: ((index * 37) % 10) - 5,
      y: ((index * 23) % 7) - 2,
      z: -1 - (index % 4) * 0.45,
      rotation: index * 0.37,
    })),
  };
}
```

- [ ] **Step 4: 实现 R3F 暖白场景**

Create `src/features/intro/WarmGalleryScene.tsx`:

```tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";
import { getWarmSceneLayout } from "./warmSceneLayout";

function Scene({ drag }: { drag: { x: number; y: number } }) {
  const group = useRef<Group>(null);
  const layout = getWarmSceneLayout();
  useFrame(({ pointer }) => {
    if (!group.current) return;
    group.current.rotation.y += (drag.x * 0.16 + pointer.x * .03 - group.current.rotation.y) * 0.06;
    group.current.rotation.x += (-drag.y * 0.08 - pointer.y * .018 - group.current.rotation.x) * 0.06;
  });
  return <group ref={group}>
    <ambientLight intensity={1.8} />
    <directionalLight position={[3, 5, 4]} intensity={2.4} />
    {layout.arches.map((arch) => <mesh key={arch.x} position={[arch.x, arch.y, -2]} scale={arch.scale}>
      <torusGeometry args={[1.2, .22, 48, 96, Math.PI]} />
      <meshStandardMaterial color="#e6e4dd" roughness={0.34} metalness={0.04} />
    </mesh>)}
    {layout.fragments.map((fragment, index) => <Float key={index} speed={0.45} rotationIntensity={0.18} floatIntensity={0.3}>
      <mesh position={[fragment.x, fragment.y, fragment.z]} rotation={[fragment.rotation, fragment.rotation * .6, 0]} scale={0.18 + (index % 3) * .05}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshTransmissionMaterial color="#f7f6f2" thickness={0.35} roughness={0.12} chromaticAberration={0.035} transmission={1} />
      </mesh>
    </Float>)}
  </group>;
}

export function WarmGalleryScene({ drag }: { drag: { x: number; y: number } }) {
  return <Canvas camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
    <Scene drag={drag} />
  </Canvas>;
}
```

- [ ] **Step 5: 实现开场 DOM 层与拖动提示**

Create `src/features/intro/IntroGallery.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { siteContent } from "@/content/site";
import { useDragParallax } from "@/hooks/useDragParallax";
import "./intro-gallery.css";

const WarmGalleryScene = dynamic(() => import("./WarmGalleryScene").then((module) => module.WarmGalleryScene), { ssr: false });

export function IntroGallery() {
  const drag = useDragParallax(.7);
  return <section className={`intro-gallery ${drag.dragging ? "is-dragging" : ""}`} {...drag.handlers} aria-labelledby="intro-title">
    <div className="intro-gallery__canvas" aria-hidden="true"><WarmGalleryScene drag={drag.offset} /></div>
    <header className="intro-gallery__identity" data-no-drag>
      <p>PORTFOLIO / 2026</p><h1 id="intro-title">{siteContent.name}</h1><p>{siteContent.tagline}</p>
    </header>
    <p className="intro-gallery__hint">SCROLL TO EXPLORE · HOLD AND DRAG</p>
  </section>;
}
```

Create `src/features/intro/intro-gallery.css`:

```css
.intro-gallery { position:relative; min-height:100svh; cursor:grab; background:transparent; }
.intro-gallery.is-dragging { cursor:grabbing; }
.intro-gallery::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.18; mix-blend-mode:multiply; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E"); }
.intro-gallery__canvas { position:fixed; inset:0; z-index:0; pointer-events:none; }
.intro-gallery__identity { position:absolute; z-index:1; top:7vh; left:4vw; max-width:70rem; }
.intro-gallery__identity h1 { margin:.2rem 0; font-size:clamp(4rem,12vw,12rem); font-weight:500; letter-spacing:-.07em; line-height:.82; }
.intro-gallery__identity p { margin:.45rem 0; font-size:.75rem; letter-spacing:.18em; }
.intro-gallery__hint { position:absolute; z-index:1; bottom:2.5rem; left:50%; transform:translateX(-50%); font-size:.7rem; letter-spacing:.16em; }
```

- [ ] **Step 6: 验证并提交**

Run:

```powershell
npm test -- src/features/intro/warmSceneLayout.test.ts
npm run build
```

Expected: test PASS and build succeeds.

```powershell
git add src/features/intro
git commit -m "feat: build warm interactive gallery intro"
```

### Task 6: 实现双列作品墙与动态预览

**Files:**
- Create: `src/features/projects/ProjectCard.tsx`
- Create: `src/features/projects/ProjectWall.tsx`
- Create: `src/features/projects/ProjectWall.test.tsx`
- Create: `src/features/projects/project-wall.css`

- [ ] **Step 1: 写失败的作品墙交互测试**

Create `src/features/projects/ProjectWall.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useExperienceStore } from "@/store/experience";
import { ProjectWall } from "./ProjectWall";

describe("ProjectWall", () => {
  beforeEach(() => useExperienceStore.setState(useExperienceStore.getInitialState()));

  it("renders six explicit placeholder works and opens one", () => {
    render(<ProjectWall />);
    expect(screen.getAllByRole("button", { name: /VISUAL STUDY/ })).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: /VISUAL STUDY 01/ }));
    expect(useExperienceStore.getState().selectedProjectId).toBe("work-01");
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/features/projects/ProjectWall.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: 实现作品卡片**

Create `src/features/projects/ProjectCard.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Project } from "@/types/project";

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: (id: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const preview = project.previewSrc && project.mediaKind === "video";
  return <article className="project-card">
    <button className="project-card__media" data-no-drag aria-label={`查看 ${project.title}`} onClick={() => onOpen(project.id)}
      onMouseEnter={() => video.current?.play()} onMouseLeave={() => { video.current?.pause(); if (video.current) video.current.currentTime = 0; }}>
      <Image src={project.coverSrc} alt="" fill sizes="(min-width: 900px) 46vw, 92vw" />
      {preview ? <video ref={video} src={project.previewSrc ?? undefined} muted loop playsInline preload="metadata" /> : null}
      {project.placeholder ? <span className="project-card__placeholder">PLACEHOLDER</span> : null}
    </button>
    <div className="project-card__meta"><h2>{project.title}</h2><p>{project.category} · {project.year}</p></div>
  </article>;
}
```

- [ ] **Step 4: 实现双列作品墙**

Create `src/features/projects/ProjectWall.tsx`:

```tsx
"use client";

import { projects } from "@/content/projects";
import { useExperienceStore } from "@/store/experience";
import { ProjectCard } from "./ProjectCard";
import "./project-wall.css";

export function ProjectWall() {
  const openProject = useExperienceStore((state) => state.openProject);
  return <section id="works" className="project-wall" aria-labelledby="works-title">
    <header><p>SELECTED WORKS</p><h2 id="works-title">精选作品</h2></header>
    <div className="project-wall__grid">{projects.map((project) => <ProjectCard key={project.id} project={project} onOpen={openProject} />)}</div>
  </section>;
}
```

Create `src/features/projects/project-wall.css`:

```css
.project-wall { position:relative; z-index:1; padding:8rem 4vw 16rem; background:rgba(239,238,233,.76); backdrop-filter:blur(1.5px); }
.project-wall>header { text-align:center; margin-bottom:4rem; }
.project-wall>header p { font-size:.7rem; letter-spacing:.18em; }
.project-wall>header h2 { margin:.2rem 0; font-size:clamp(3.5rem,7vw,7rem); font-weight:500; letter-spacing:-.06em; }
.project-wall__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5rem 2.5rem; max-width:1500px; margin:auto; }
.project-card__media { position:relative; display:block; width:100%; aspect-ratio:16/10; overflow:hidden; border:1px solid rgba(17,17,20,.24); border-radius:1.3rem; padding:0; background:#111; cursor:none; }
.project-card__media img,.project-card__media video { object-fit:cover; transition:transform .8s cubic-bezier(.2,.8,.2,1),filter .5s; }
.project-card__media:hover img { transform:scale(1.035); filter:saturate(1.08) contrast(1.03); }
.project-card__media video { position:absolute; inset:0; width:100%; height:100%; }
.project-card__placeholder { position:absolute; top:1rem; left:1rem; padding:.35rem .55rem; background:#efeee9; font-size:.62rem; letter-spacing:.14em; }
.project-card__meta { display:flex; justify-content:space-between; gap:1rem; border-bottom:1px solid rgba(17,17,20,.35); padding:.85rem 0; }
.project-card__meta h2,.project-card__meta p { margin:0; font-size:.85rem; font-weight:500; }
@media (max-width:800px){.project-wall__grid{grid-template-columns:1fr}.project-wall{padding-inline:1rem}.project-wall__grid{gap:3rem}}
```

- [ ] **Step 5: 验证并提交**

Run: `npm test -- src/features/projects/ProjectWall.test.tsx`

Expected: PASS.

```powershell
git add src/features/projects
git commit -m "feat: add cinematic project wall"
```

### Task 7: 实现明暗入口与滚动驱动转场

**Files:**
- Create: `src/features/portal/portalState.ts`
- Create: `src/features/portal/portalState.test.ts`
- Create: `src/features/portal/PortalTransition.tsx`
- Create: `src/features/portal/portal-transition.css`
- Modify: `src/store/experience.ts`
- Modify: `src/store/experience.test.ts`

- [ ] **Step 1: 写失败的转场映射测试**

Create `src/features/portal/portalState.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getPortalState } from "./portalState";

describe("portal transition", () => {
  it("starts white, reaches a full dark reveal, and remains reversible", () => {
    expect(getPortalState(0)).toEqual({ darkness: 0, radius: 8, tunnelOpacity: 0 });
    expect(getPortalState(.5)).toEqual({ darkness: .5, radius: 74, tunnelOpacity: .25 });
    expect(getPortalState(1)).toEqual({ darkness: 1, radius: 140, tunnelOpacity: 1 });
  });
});
```

Extend `src/store/experience.test.ts`:

```ts
it("stores reversible tunnel progress", () => {
  useExperienceStore.getState().setTunnelProgress(.72);
  expect(useExperienceStore.getState().tunnelProgress).toBe(.72);
  useExperienceStore.getState().setTunnelProgress(.18);
  expect(useExperienceStore.getState().tunnelProgress).toBe(.18);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/features/portal/portalState.test.ts src/store/experience.test.ts`

Expected: FAIL because `getPortalState` and `setTunnelProgress` do not exist.

- [ ] **Step 3: 实现确定性的转场映射**

Create `src/features/portal/portalState.ts`:

```ts
import { clamp } from "@/lib/motion";

const round = (value: number) => Math.round(value * 100) / 100;
export function getPortalState(progress: number) {
  const p = clamp(progress, 0, 1);
  return {
    darkness: round(p),
    radius: round(8 + p * 132),
    tunnelOpacity: round(clamp((p - .35) / .6, 0, 1)),
  };
}
```

Modify `src/store/experience.ts` by adding the state and action:

```ts
tunnelProgress: number;
setTunnelProgress: (progress: number) => void;
```

and initialize them inside the store:

```ts
tunnelProgress: 0,
setTunnelProgress: (tunnelProgress) => set({ tunnelProgress }),
```

- [ ] **Step 4: 实现 GSAP 滚动转场**

Create `src/features/portal/PortalTransition.tsx`:

```tsx
"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getPortalState } from "./portalState";
import { useExperienceStore } from "@/store/experience";
import "./portal-transition.css";

export function PortalTransition({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const setTunnelProgress = useExperienceStore((state) => state.setTunnelProgress);
  const setPhase = useExperienceStore((state) => state.setPhase);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!root.current || !stage.current) return;
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: .7,
        onUpdate: ({ progress }) => {
          const state = getPortalState(progress);
          stage.current?.style.setProperty("--portal-radius", `${state.radius}vmax`);
          stage.current?.style.setProperty("--portal-darkness", String(state.darkness));
          stage.current?.style.setProperty("--tunnel-opacity", String(state.tunnelOpacity));
          setTunnelProgress(progress);
          setPhase(progress < .08 ? "PORTAL" : progress > .92 ? "OUTRO" : "TUNNEL");
        },
      });
    }, root);
    return () => context.revert();
  }, [setPhase, setTunnelProgress]);

  return <section ref={root} className="portal-transition" aria-label="进入三维作品展厅">
    <div ref={stage} className="portal-transition__stage">
      <div className="portal-transition__tunnel">{children}</div>
      <div className="portal-transition__iris" aria-hidden="true" />
    </div>
  </section>;
}
```

Create `src/features/portal/portal-transition.css`:

```css
.portal-transition { position:relative; z-index:1; height:360vh; background:#efeee9; }
.portal-transition__stage { --portal-radius:8vmax; --portal-darkness:0; --tunnel-opacity:0; position:sticky; top:0; height:100svh; overflow:hidden; background:#efeee9; }
.portal-transition__tunnel { position:absolute; inset:0; opacity:var(--tunnel-opacity); clip-path:circle(var(--portal-radius) at 50% 50%); background:#09090c; }
.portal-transition__iris { position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 50% 50%,transparent 0 var(--portal-radius),rgba(9,9,12,var(--portal-darkness)) calc(var(--portal-radius) + .7vmax)); box-shadow:inset 0 0 8rem rgba(130,160,255,.12); }
```

- [ ] **Step 5: 验证并提交**

Run:

```powershell
npm test -- src/features/portal/portalState.test.ts src/store/experience.test.ts
npm run build
```

Expected: tests PASS and build succeeds.

```powershell
git add src/features/portal src/store
git commit -m "feat: add reversible portal transition"
```

### Task 8: 实现可穿行的深色 3D 作品隧道

**Files:**
- Create: `src/features/tunnel/tunnelLayout.ts`
- Create: `src/features/tunnel/tunnelLayout.test.ts`
- Create: `src/features/tunnel/TunnelScene.tsx`
- Create: `src/features/tunnel/TunnelGallery.tsx`
- Create: `src/features/tunnel/tunnel-gallery.css`

- [ ] **Step 1: 写失败的隧道布局与镜头测试**

Create `src/features/tunnel/tunnelLayout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getCameraPose, getTunnelLayout } from "./tunnelLayout";

describe("tunnel layout", () => {
  it("places three featured screens at descending depths", () => {
    const screens = getTunnelLayout(3).screens;
    expect(screens).toHaveLength(3);
    expect(screens[0].z).toBeGreaterThan(screens[1].z);
    expect(screens[1].z).toBeGreaterThan(screens[2].z);
  });

  it("keeps drag offsets bounded while moving the camera forward", () => {
    expect(getCameraPose(0, { x: 5, y: -5 })).toEqual({ x: 1.2, y: -.65, z: 7 });
    expect(getCameraPose(1, { x: 0, y: 0 }).z).toBe(-17);
    expect(getCameraPose(1, { x: 0, y: 0 }, 14).z).toBe(-7);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/features/tunnel/tunnelLayout.test.ts`

Expected: FAIL because tunnel layout helpers do not exist.

- [ ] **Step 3: 实现隧道布局与镜头路径**

Create `src/features/tunnel/tunnelLayout.ts`:

```ts
import { clamp, type Point } from "@/lib/motion";

export function getTunnelLayout(projectCount: number) {
  return {
    frames: Array.from({ length: 9 }, (_, index) => ({ z: 4 - index * 3.2 })),
    screens: Array.from({ length: projectCount }, (_, index) => ({
      x: index % 2 === 0 ? -2.45 : 2.45,
      y: index === 1 ? .7 : -.2,
      z: -2.5 - index * 7.2,
      rotationY: index % 2 === 0 ? .18 : -.18,
    })),
  };
}

export function getCameraPose(progress: number, drag: Point, travel = 24) {
  const p = clamp(progress, 0, 1);
  return {
    x: clamp(drag.x * 1.2, -1.2, 1.2),
    y: clamp(drag.y * .65, -.65, .65),
    z: 7 - p * travel,
  };
}
```

- [ ] **Step 4: 实现程序化隧道和重点作品屏幕**

Create `src/features/tunnel/TunnelScene.tsx`:

```tsx
"use client";

import { Image as DreiImage } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { projects } from "@/content/projects";
import { useExperienceStore } from "@/store/experience";
import { getCameraPose, getTunnelLayout } from "./tunnelLayout";

export function TunnelScene({ drag, travel = 24, canOpen }: {
  drag: { x: number; y: number };
  travel?: number;
  canOpen: () => boolean;
}) {
  const progress = useExperienceStore((state) => state.tunnelProgress);
  const openProject = useExperienceStore((state) => state.openProject);
  const featured = useMemo(() => projects.filter((project) => project.featured3d), []);
  const layout = useMemo(() => getTunnelLayout(featured.length), [featured.length]);

  useFrame(({ camera }) => {
    const pose = getCameraPose(progress, drag, travel);
    camera.position.x += (pose.x - camera.position.x) * .055;
    camera.position.y += (pose.y - camera.position.y) * .055;
    camera.position.z += (pose.z - camera.position.z) * .045;
    camera.lookAt(camera.position.x * .15, camera.position.y * .15, camera.position.z - 5);
  });

  return <>
    <fog attach="fog" args={["#09090c", 8, 34]} />
    <ambientLight intensity={.32} />
    <pointLight position={[0, 2, 2]} intensity={22} color="#b7c8ff" distance={16} />
    {layout.frames.map((frame) => <group key={frame.z} position={[0, 0, frame.z]}>
      <mesh position={[0, 3.4, 0]}><boxGeometry args={[8.4, .08, .08]} /><meshStandardMaterial color="#9ca4b8" metalness={.95} roughness={.18} /></mesh>
      <mesh position={[0, -3.4, 0]}><boxGeometry args={[8.4, .08, .08]} /><meshStandardMaterial color="#9ca4b8" metalness={.95} roughness={.18} /></mesh>
      <mesh position={[-4.2, 0, 0]}><boxGeometry args={[.08, 6.8, .08]} /><meshStandardMaterial color="#9ca4b8" metalness={.95} roughness={.18} /></mesh>
      <mesh position={[4.2, 0, 0]}><boxGeometry args={[.08, 6.8, .08]} /><meshStandardMaterial color="#9ca4b8" metalness={.95} roughness={.18} /></mesh>
    </group>)}
    {featured.map((project, index) => {
      const screen = layout.screens[index];
      return <DreiImage key={project.id} url={project.coverSrc} position={[screen.x, screen.y, screen.z]}
        rotation={[0, screen.rotationY, 0]} scale={[4.2, 2.62]} transparent toneMapped={false}
        onClick={(event) => { event.stopPropagation(); if (canOpen()) openProject(project.id); }} />;
    })}
  </>;
}
```

- [ ] **Step 5: 实现隧道容器与拖动层**

Create `src/features/tunnel/TunnelGallery.tsx`:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useEffect, useState } from "react";
import { useDragParallax } from "@/hooks/useDragParallax";
import { useExperienceStore } from "@/store/experience";
import { resolveQualityPreset } from "@/lib/quality";
import { TunnelScene } from "./TunnelScene";
import "./tunnel-gallery.css";

export function TunnelGallery() {
  const drag = useDragParallax(1, false);
  const [compact, setCompact] = useState(false);
  const progress = useExperienceStore((state) => state.tunnelProgress);
  const qualityMode = useExperienceStore((state) => state.qualityMode);
  const quality = resolveQualityPreset(qualityMode, { dpr: typeof window === "undefined" ? 1 : window.devicePixelRatio, webgl2: true });
  const active = progress > .02 && progress < .99;
  useEffect(() => {
    const query = window.matchMedia("(max-width: 800px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return <div className={`tunnel-gallery ${drag.dragging ? "is-dragging" : ""}`} {...drag.handlers}>
    {active ? <Canvas camera={{ position: [0, 0, 7], fov: 48 }} dpr={quality.dpr} shadows={quality.shadows} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <Suspense fallback={null}>
        <TunnelScene drag={drag.offset} travel={compact ? 14 : 24} canOpen={() => !drag.didDrag()} />
        {quality.postprocessing ? <EffectComposer><Bloom intensity={.7} luminanceThreshold={.58} mipmapBlur /></EffectComposer> : null}
      </Suspense>
    </Canvas> : null}
    <p className="tunnel-gallery__hint">SCROLL TO MOVE · HOLD AND DRAG TO LOOK</p>
  </div>;
}
```

Create `src/features/tunnel/tunnel-gallery.css`:

```css
.tunnel-gallery { position:absolute; inset:0; cursor:grab; background:#09090c; color:#efeee9; }
.tunnel-gallery.is-dragging { cursor:grabbing; }
.tunnel-gallery__hint { position:absolute; left:50%; bottom:1.7rem; transform:translateX(-50%); margin:0; font-size:.65rem; letter-spacing:.16em; pointer-events:none; }
```

- [ ] **Step 6: 验证并提交**

Run:

```powershell
npm test -- src/features/tunnel/tunnelLayout.test.ts
npm run build
```

Expected: test PASS and build succeeds without server-side WebGL access.

The tunnel canvas mounts only while portal progress is between `.02` and `.99`; leaving the tunnel unmounts R3F resources instead of retaining a hidden GPU scene.

```powershell
git add src/features/tunnel
git commit -m "feat: add navigable 3d project tunnel"
```

### Task 9: 实现全屏作品查看器、画质和声音控制

**Files:**
- Create: `src/audio/createAudioEngine.ts`
- Create: `src/features/viewer/ProjectViewer.tsx`
- Create: `src/features/viewer/ProjectViewer.test.tsx`
- Create: `src/features/viewer/project-viewer.css`
- Create: `src/features/shell/GlobalControls.tsx`
- Create: `src/features/shell/CustomCursor.tsx`
- Create: `src/features/shell/GlobalControls.test.tsx`
- Create: `src/features/shell/global-controls.css`

- [ ] **Step 1: 写失败的查看器和控制项测试**

Create `src/features/viewer/ProjectViewer.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useExperienceStore } from "@/store/experience";
import { ProjectViewer } from "./ProjectViewer";

describe("ProjectViewer", () => {
  beforeEach(() => useExperienceStore.setState({ ...useExperienceStore.getInitialState(), selectedProjectId: "work-01" }));

  it("shows minimal metadata and closes on Escape", () => {
    render(<ProjectViewer />);
    expect(screen.getByRole("dialog")).toHaveTextContent("VISUAL STUDY 01");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(useExperienceStore.getState().selectedProjectId).toBeNull();
  });
});
```

Create `src/features/shell/GlobalControls.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useExperienceStore } from "@/store/experience";
import { GlobalControls } from "./GlobalControls";

describe("GlobalControls", () => {
  beforeEach(() => useExperienceStore.setState(useExperienceStore.getInitialState()));

  it("is muted and high quality by default", () => {
    render(<GlobalControls />);
    expect(screen.getByRole("button", { name: /声音：关闭/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /画质：HIGH/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /画质：HIGH/ }));
    expect(useExperienceStore.getState().qualityMode).toBe("AUTO");
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/features/viewer/ProjectViewer.test.tsx src/features/shell/GlobalControls.test.tsx`

Expected: FAIL because viewer and controls do not exist.

- [ ] **Step 3: 实现用户主动开启的原创程序化环境音**

Create `src/audio/createAudioEngine.ts`:

```ts
export type AudioEngine = { start: () => void; stop: () => void; dispose: () => void };

export function createAudioEngine(): AudioEngine {
  let context: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let gain: GainNode | null = null;
  const start = () => {
    if (context && gain) {
      void context.resume();
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.linearRampToValueAtTime(.012, context.currentTime + .45);
      return;
    }
    context = new AudioContext();
    oscillator = context.createOscillator();
    gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 54;
    gain.gain.value = 0;
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    gain.gain.linearRampToValueAtTime(.012, context.currentTime + 1.2);
  };
  const stop = () => {
    if (!context || !gain) return;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + .3);
  };
  const dispose = () => { oscillator?.stop(); void context?.close(); context = oscillator = gain = null; };
  return { start, stop, dispose };
}
```

- [ ] **Step 4: 实现全屏作品查看器**

Create `src/features/viewer/ProjectViewer.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect } from "react";
import { projects } from "@/content/projects";
import { useExperienceStore } from "@/store/experience";
import "./project-viewer.css";

export function ProjectViewer() {
  const id = useExperienceStore((state) => state.selectedProjectId);
  const close = useExperienceStore((state) => state.closeProject);
  const open = useExperienceStore((state) => state.openProject);
  const index = projects.findIndex((project) => project.id === id);
  const project = index >= 0 ? projects[index] : null;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);
  if (!project) return null;
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  return <div className="project-viewer" role="dialog" aria-modal="true" aria-label={project.title}>
    <button data-no-drag className="project-viewer__close" onClick={close}>关闭</button>
    <div className="project-viewer__media">
      {project.mediaKind === "video" ? <video src={project.fullSrc} controls autoPlay playsInline /> : <Image src={project.fullSrc} alt={project.title} fill sizes="100vw" priority />}
    </div>
    <footer><div><h2>{project.title}</h2><p>{project.category} · {project.year}</p></div>
      <nav><button onClick={() => open(previous.id)}>上一个</button><button onClick={() => open(next.id)}>下一个</button></nav>
    </footer>
  </div>;
}
```

Create `src/features/viewer/project-viewer.css`:

```css
.project-viewer { position:fixed; inset:0; z-index:80; display:grid; grid-template-rows:1fr auto; padding:1.2rem; background:rgba(7,7,10,.96); color:#efeee9; }
.project-viewer__media { position:relative; min-height:0; overflow:hidden; border-radius:1rem; }
.project-viewer__media img,.project-viewer__media video { width:100%; height:100%; object-fit:contain; }
.project-viewer__close { position:absolute; z-index:2; top:2rem; right:2rem; border:0; border-radius:999px; padding:.7rem 1rem; background:#efeee9; color:#111114; }
.project-viewer footer { display:flex; justify-content:space-between; align-items:end; padding-top:1rem; }
.project-viewer h2,.project-viewer p { margin:.2rem 0; }
.project-viewer nav { display:flex; gap:.5rem; }
```

- [ ] **Step 5: 实现固定全局控制**

Create `src/features/shell/GlobalControls.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { createAudioEngine, type AudioEngine } from "@/audio/createAudioEngine";
import { useExperienceStore } from "@/store/experience";
import type { QualityMode } from "@/lib/quality";
import "./global-controls.css";

const nextMode: Record<QualityMode, QualityMode> = { HIGH: "AUTO", AUTO: "LITE", LITE: "HIGH" };

export function GlobalControls() {
  const muted = useExperienceStore((state) => state.muted);
  const toggleMuted = useExperienceStore((state) => state.toggleMuted);
  const quality = useExperienceStore((state) => state.qualityMode);
  const setQuality = useExperienceStore((state) => state.setQualityMode);
  const engine = useRef<AudioEngine | null>(null);
  useEffect(() => () => engine.current?.dispose(), []);
  const toggleSound = () => {
    if (muted) { engine.current ??= createAudioEngine(); engine.current.start(); }
    else engine.current?.stop();
    toggleMuted();
  };
  return <nav className="global-controls" aria-label="体验控制" data-no-drag>
    <a href="#works">作品</a>
    <a href="#outro">跳过3D</a>
    <button aria-label={`声音：${muted ? "关闭" : "开启"}`} onClick={toggleSound}>SOUND {muted ? "OFF" : "ON"}</button>
    <button aria-label={`画质：${quality}`} onClick={() => setQuality(nextMode[quality])}>{quality}</button>
  </nav>;
}
```

Create `src/features/shell/CustomCursor.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = cursor.current;
    if (!node || window.matchMedia("(pointer:coarse)").matches) return;
    let frame = 0;
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...current };
    const render = () => {
      current.x += (target.x - current.x) * .22;
      current.y += (target.y - current.y) * .22;
      node.style.left = `${current.x}px`;
      node.style.top = `${current.y}px`;
      frame = requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      node.dataset.active = String(Boolean((event.target as HTMLElement).closest("a,button,[role='button']")));
    };
    const down = () => { node.dataset.pressed = "true"; };
    const up = () => { node.dataset.pressed = "false"; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);
  return <div ref={cursor} className="custom-cursor" aria-hidden="true" />;
}
```

Create `src/features/shell/global-controls.css`:

```css
.global-controls { position:fixed; z-index:100; top:1rem; right:1rem; display:flex; align-items:center; gap:.35rem; padding:.35rem; border:1px solid rgba(17,17,20,.18); border-radius:999px; background:rgba(239,238,233,.78); backdrop-filter:blur(18px); }
.global-controls a,.global-controls button { border:0; border-radius:999px; padding:.55rem .75rem; background:transparent; text-decoration:none; font-size:.68rem; letter-spacing:.08em; cursor:pointer; }
.global-controls a:hover,.global-controls button:hover { background:#111114; color:#efeee9; }
.custom-cursor { position:fixed; z-index:200; top:0; left:0; width:1.3rem; height:1.3rem; pointer-events:none; border:1px solid rgba(17,17,20,.8); border-radius:50%; mix-blend-mode:difference; transform:translate(-50%,-50%) scale(1); transition:width .2s,height .2s,background .2s,transform .12s; }
.custom-cursor[data-active="true"] { width:3rem; height:3rem; background:rgba(255,255,255,.22); }
.custom-cursor[data-active="true"]::after { content:"VIEW"; position:absolute; inset:0; display:grid; place-items:center; color:#fff; font-size:.48rem; letter-spacing:.08em; }
.custom-cursor[data-pressed="true"] { transform:translate(-50%,-50%) scale(.78); }
@media (pointer:coarse){.custom-cursor{display:none}}
```

- [ ] **Step 6: 验证并提交**

Run: `npm test -- src/features/viewer/ProjectViewer.test.tsx src/features/shell/GlobalControls.test.tsx`

Expected: PASS.

```powershell
git add src/audio src/features/viewer src/features/shell/GlobalControls.tsx src/features/shell/GlobalControls.test.tsx src/features/shell/global-controls.css
git commit -m "feat: add project viewer and experience controls"
```

### Task 10: 组装完整体验与桌面优先版式

**Files:**
- Create: `src/features/shell/ExperienceShell.tsx`
- Create: `src/features/shell/experience-shell.css`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/features/shell/ExperienceShell.test.tsx`

- [ ] **Step 1: 写失败的完整结构测试**

Create `src/features/shell/ExperienceShell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { vi, describe, expect, it } from "vitest";

vi.mock("@/features/intro/IntroGallery", () => ({ IntroGallery: () => <section aria-label="暖白开场" /> }));
vi.mock("@/features/tunnel/TunnelGallery", () => ({ TunnelGallery: () => <div aria-label="3D展厅" /> }));
import { ExperienceShell } from "./ExperienceShell";

describe("ExperienceShell", () => {
  it("keeps identity, work, tunnel and contact in a readable order", () => {
    render(<ExperienceShell />);
    expect(screen.getByLabelText("暖白开场")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "精选作品" })).toBeInTheDocument();
    expect(screen.getByLabelText("3D展厅")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/features/shell/ExperienceShell.test.tsx`

Expected: FAIL because `ExperienceShell` does not exist.

- [ ] **Step 3: 实现 Lenis 驱动和模块组装**

Create `src/features/shell/ExperienceShell.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { siteContent } from "@/content/site";
import { IntroGallery } from "@/features/intro/IntroGallery";
import { ProjectWall } from "@/features/projects/ProjectWall";
import { PortalTransition } from "@/features/portal/PortalTransition";
import { TunnelGallery } from "@/features/tunnel/TunnelGallery";
import { ProjectViewer } from "@/features/viewer/ProjectViewer";
import { GlobalControls } from "./GlobalControls";
import { CustomCursor } from "./CustomCursor";
import "./experience-shell.css";

export function ExperienceShell() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: .08, smoothWheel: true });
    let frame = 0;
    const tick = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); lenis.destroy(); };
  }, []);

  return <>
    <CustomCursor />
    <GlobalControls />
    <main>
      <IntroGallery />
      <ProjectWall />
      <PortalTransition><TunnelGallery /></PortalTransition>
      <footer id="outro" className="outro">
        <p>THANK YOU FOR EXPLORING</p><h2>{siteContent.name}</h2>
        <div>{siteContent.email ? <a href={`mailto:${siteContent.email}`}>{siteContent.email}</a> : <span>CONTACT PLACEHOLDER</span>}</div>
      </footer>
    </main>
    <ProjectViewer />
  </>;
}
```

Create `src/features/shell/experience-shell.css`:

```css
.outro { min-height:100svh; display:flex; flex-direction:column; justify-content:flex-end; gap:1rem; padding:5vw; background:#efeee9; }
.outro p { font-size:.7rem; letter-spacing:.18em; }
.outro h2 { margin:0; font-size:clamp(4rem,14vw,13rem); font-weight:500; letter-spacing:-.07em; line-height:.78; }
```

Modify `src/app/page.tsx`:

```tsx
import { ExperienceShell } from "@/features/shell/ExperienceShell";
export default function HomePage() { return <ExperienceShell />; }
```

- [ ] **Step 4: 增加桌面优先和减少动态效果规则**

Append to `src/app/globals.css`:

```css
html,body { width:100%; min-height:100%; }
body { overflow-x:hidden; }
::selection { color:#efeee9; background:#111114; }
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after { scroll-behavior:auto!important; animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; }
}
@media (max-width:800px){
  .global-controls { max-width:calc(100vw - 2rem); overflow:auto; }
}
```

- [ ] **Step 5: 验证并提交**

Run:

```powershell
npm test -- src/features/shell/ExperienceShell.test.tsx
npm run build
```

Expected: test PASS and build succeeds.

```powershell
git add src/app src/features/shell
git commit -m "feat: assemble dual-world portfolio experience"
```

### Task 11: 加入 WebGL 容错、媒体回退与 AUTO 帧率保护

**Files:**
- Create: `src/lib/webgl.ts`
- Create: `src/lib/webgl.test.ts`
- Create: `src/hooks/useFrameBudget.ts`
- Create: `src/hooks/useWebGLSupport.ts`
- Create: `src/features/fallback/FallbackGallery.tsx`
- Create: `src/features/fallback/GraphicsBoundary.tsx`
- Create: `src/features/fallback/GraphicsBoundary.test.tsx`
- Create: `src/features/fallback/fallback-gallery.css`
- Modify: `src/features/intro/IntroGallery.tsx`
- Modify: `src/features/intro/intro-gallery.css`
- Modify: `src/features/tunnel/TunnelGallery.tsx`
- Modify: `src/features/viewer/ProjectViewer.tsx`

- [ ] **Step 1: 写失败的 WebGL 和帧率分类测试**

Create `src/lib/webgl.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { supportsWebGL2 } from "./webgl";

describe("supportsWebGL2", () => {
  it("returns false when canvas cannot create a WebGL2 context", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(supportsWebGL2()).toBe(false);
  });
});
```

Create `src/features/fallback/GraphicsBoundary.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GraphicsBoundary } from "./GraphicsBoundary";

function BrokenScene(): never { throw new Error("graphics failed"); }

describe("GraphicsBoundary", () => {
  it("renders a usable fallback after a scene render error", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<GraphicsBoundary fallback={<p>2D fallback</p>}><BrokenScene /></GraphicsBoundary>);
    expect(screen.getByText("2D fallback")).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/lib/webgl.test.ts src/features/fallback/GraphicsBoundary.test.tsx`

Expected: FAIL because WebGL detection and the graphics error boundary do not exist.

- [ ] **Step 3: 实现能力检测和 AUTO 帧率 Hook**

Create `src/lib/webgl.ts`:

```ts
export function supportsWebGL2() {
  if (typeof document === "undefined") return false;
  try { return Boolean(document.createElement("canvas").getContext("webgl2")); }
  catch { return false; }
}
```

Create `src/hooks/useFrameBudget.ts`:

```tsx
"use client";

import { useEffect } from "react";
import { classifyFps } from "@/lib/quality";
import { useExperienceStore } from "@/store/experience";

export function useFrameBudget() {
  const mode = useExperienceStore((state) => state.qualityMode);
  const setMode = useExperienceStore((state) => state.setQualityMode);
  useEffect(() => {
    if (mode !== "AUTO") return;
    const samples: number[] = [];
    let previous = performance.now();
    let frame = 0;
    const sample = (now: number) => {
      samples.push(1000 / Math.max(now - previous, 1));
      previous = now;
      if (samples.length < 120) frame = requestAnimationFrame(sample);
      else if (classifyFps(samples.slice(-60)) === "LITE") setMode("LITE");
    };
    frame = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(frame);
  }, [mode, setMode]);
}
```

Create `src/hooks/useWebGLSupport.ts`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { supportsWebGL2 } from "@/lib/webgl";

export function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => setSupported(supportsWebGL2()), []);
  return supported;
}
```

- [ ] **Step 4: 实现不黑屏的 2D 回退**

Create `src/features/fallback/FallbackGallery.tsx`:

```tsx
import Image from "next/image";
import type { CSSProperties } from "react";
import { projects } from "@/content/projects";
import "./fallback-gallery.css";

export function FallbackGallery({ dark = false }: { dark?: boolean }) {
  return <div className={`fallback-gallery ${dark ? "is-dark" : ""}`} role="img" aria-label="二维动态作品背景">
    {projects.slice(0, 3).map((project, index) => <div key={project.id} className="fallback-gallery__image" style={{
      "--x": `${12 + index * 23}vw`, "--y": `${18 + index * 12}vh`, "--r": `${(index - 1) * 4}deg`,
    } as CSSProperties}>
      <Image src={project.coverSrc} alt="" fill sizes="34vw" />
    </div>)}
  </div>;
}
```

Create `src/features/fallback/GraphicsBoundary.tsx`:

```tsx
"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export class GraphicsBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D scene failed; showing 2D fallback", error, info.componentStack);
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
```

Create `src/features/fallback/fallback-gallery.css`:

```css
.fallback-gallery { position:absolute; inset:0; overflow:hidden; background:#efeee9; }
.fallback-gallery.is-dark { background:#09090c; }
.fallback-gallery__image { position:absolute; width:34vw; min-width:300px; aspect-ratio:16/10; opacity:.22; filter:blur(1px); transform:translate(var(--x),var(--y)) rotate(var(--r)); }
.fallback-gallery__image img { object-fit:cover; }
```

Modify `IntroGallery.tsx` by adding these imports and replacing the canvas child. Keep the DOM identity and drag hint unchanged:

```tsx
import { FallbackGallery } from "@/features/fallback/FallbackGallery";
import { GraphicsBoundary } from "@/features/fallback/GraphicsBoundary";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

// Inside IntroGallery, before return:
const webgl = useWebGLSupport();
const fallback = <FallbackGallery />;

// Replace the existing intro-gallery__canvas div:
<div className="intro-gallery__canvas" aria-hidden="true">
  {webgl === false ? fallback : webgl === true ? (
    <GraphicsBoundary fallback={fallback}><WarmGalleryScene drag={drag.offset} /></GraphicsBoundary>
  ) : <span className="intro-gallery__loader">LOADING VISUAL LAYER</span>}
</div>
```

Append to `src/features/intro/intro-gallery.css`:

```css
.intro-gallery__loader { position:absolute; right:1rem; bottom:1rem; font-size:.62rem; letter-spacing:.14em; }
```

Modify `TunnelGallery.tsx` with these imports and calls:

```tsx
import { FallbackGallery } from "@/features/fallback/FallbackGallery";
import { GraphicsBoundary } from "@/features/fallback/GraphicsBoundary";
import { useFrameBudget } from "@/hooks/useFrameBudget";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

// Inside TunnelGallery, before resolving quality:
useFrameBudget();
const webgl = useWebGLSupport();
const fallback = <FallbackGallery dark />;

// Replace only the existing Canvas block; keep the outer div and hint:
{!active ? null : webgl === false ? fallback : webgl === true ? (
  <GraphicsBoundary fallback={fallback}>
    <Canvas camera={{ position: [0, 0, 7], fov: 48 }} dpr={quality.dpr} shadows={quality.shadows}
      gl={{ antialias: true, powerPreference: "high-performance" }}>
      <Suspense fallback={null}>
        <TunnelScene drag={drag.offset} travel={compact ? 14 : 24} canOpen={() => !drag.didDrag()} />
        {quality.postprocessing ? <EffectComposer><Bloom intensity={.7} luminanceThreshold={.58} mipmapBlur /></EffectComposer> : null}
      </Suspense>
    </Canvas>
  </GraphicsBoundary>
) : null}
```

The warm identity, project wall, global controls, outro, and skip link remain DOM content, so fallback mode never becomes a blank screen.

- [ ] **Step 5: 为全屏查看器加入媒体失败回退**

In `ProjectViewer.tsx`, track media failure and replace a failed video with its cover:

```tsx
const [mediaFailed, setMediaFailed] = useState(false);
useEffect(() => setMediaFailed(false), [id]);

// Keep this after `if (!project) return null`:
const showVideo = project.mediaKind === "video" && !mediaFailed;
const imageSrc = project.mediaKind === "video" ? project.coverSrc : project.fullSrc;
```

Render:

```tsx
{showVideo
  ? <video src={project.fullSrc} controls autoPlay playsInline onError={() => setMediaFailed(true)} />
  : <Image src={imageSrc} alt={project.title} fill sizes="100vw" priority />}
```

Add `useState` to the React import.

- [ ] **Step 6: 验证并提交**

Run:

```powershell
npm test -- src/lib/webgl.test.ts src/lib/quality.test.ts src/features/fallback/GraphicsBoundary.test.tsx
npm run check
```

Expected: tests PASS, lint PASS, build succeeds.

```powershell
git add src/lib/webgl.ts src/lib/webgl.test.ts src/hooks/useFrameBudget.ts src/hooks/useWebGLSupport.ts src/features/fallback src/features/intro/IntroGallery.tsx src/features/intro/intro-gallery.css src/features/tunnel/TunnelGallery.tsx src/features/viewer/ProjectViewer.tsx
git commit -m "feat: add graceful graphics and media fallback"
```

### Task 12: 端到端验证、高清视觉检查与交付说明

**Files:**
- Create: `e2e/experience.spec.ts`
- Create: `CONTENT_INPUTS.md`
- Create: `README.md`
- Modify: `.gitignore`
- Modify: components only when selectors or accessibility fixes are required by the tests

- [ ] **Step 1: 写端到端流程测试**

Create `e2e/experience.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("desktop visitor can browse work without enabling sound", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "YOUR NAME" })).toBeVisible();
  await expect(page.getByRole("button", { name: "声音：关闭" })).toBeVisible();
  await page.getByRole("link", { name: "作品" }).click();
  await expect(page.getByRole("heading", { name: "精选作品" })).toBeVisible();
  await page.getByRole("button", { name: "查看 VISUAL STUDY 01" }).click();
  await expect(page.getByRole("dialog", { name: "VISUAL STUDY 01" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("skip control reaches contact fallback", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "跳过3D" }).click();
  await expect(page.getByText("CONTACT PLACEHOLDER")).toBeVisible();
});

test("quality cycles from HIGH to AUTO to LITE", async ({ page }) => {
  await page.goto("/");
  const quality = page.getByRole("button", { name: "画质：HIGH" });
  await quality.click();
  await expect(page.getByRole("button", { name: "画质：AUTO" })).toBeVisible();
  await page.getByRole("button", { name: "画质：AUTO" }).click();
  await expect(page.getByRole("button", { name: "画质：LITE" })).toBeVisible();
});
```

- [ ] **Step 2: 安装浏览器并运行自动验证**

Run:

```powershell
npx playwright install chromium
npm run check
npm run test:e2e
```

Expected: lint, all Vitest tests, production build, and all Playwright tests PASS in both desktop projects.

- [ ] **Step 3: 进行 1440×900 与 1920×1080 高清视觉检查**

Append to `.gitignore` before capturing local QA files:

```gitignore
output/qa/
```

Run the production build:

```powershell
npm run build
npm run start
```

In a second terminal, capture both target sizes:

```powershell
npx playwright screenshot --viewport-size="1440,900" --full-page http://127.0.0.1:3000 output/qa/portfolio-1440.png
npx playwright screenshot --viewport-size="1920,1080" --full-page http://127.0.0.1:3000 output/qa/portfolio-1080p.png
```

Inspect both images and the live browser for: correct card crop, crisp text, no horizontal overflow, visible global controls, warm-white grain without banding, a complete portal reveal, and readable outro. Keep `output/qa/` uncommitted.

- [ ] **Step 4: 检查拖动、反复打开和资源释放**

Use the live production page and perform this exact sequence:

1. Drag the warm gallery left/right ten times and verify click targets still open after drag ends.
2. Scroll forward into the tunnel, drag to both limits, then scroll back to the white wall.
3. Open and close each of the six placeholder works three times.
4. Cycle `HIGH → AUTO → LITE → HIGH` twice.
5. Toggle sound on, off, and refresh; verify refresh returns to muted.
6. In Chrome Task Manager, confirm GPU memory returns near its previous level after closing the viewer and leaving the tunnel; investigate any monotonic increase.

Expected: no stuck cursor, no trapped scroll, no duplicated audio, no black screen, and no monotonic resource growth.

- [ ] **Step 5: 写清真实内容替换清单**

Create `CONTENT_INPUTS.md`:

```md
# 上线前真实内容清单

- 显示名称或个人代号
- 一句极简定位文案
- 5–7 个真实作品：名称、年份、单个类型标签、高清封面、全屏媒体
- 其中 2–3 个重点作品的选择
- 可选的 3–8 秒静音循环预览
- 邮箱、社交链接和简历文件

所有 `YOUR NAME`、`CONTACT PLACEHOLDER`、`VISUAL STUDY` 和 `PLACEHOLDER` 内容都必须在上线前替换。不得把示例内容描述成真实经历或真实客户项目。
```

Create `README.md`:

```md
# Immersive Portfolio

双世界沉浸式个人作品集：暖白艺术展厅、鼠标拖动、滚动明暗转场与深色 3D 作品隧道。

## Commands

- `npm run dev` — 本地开发
- `npm test` — 单元与组件测试
- `npm run test:e2e` — 桌面端流程测试
- `npm run check` — lint、测试和生产构建

## Content

先阅读 `CONTENT_INPUTS.md`，再替换 `src/content/site.ts`、`src/content/projects.ts` 和 `public/media/` 中的占位内容。
```

- [ ] **Step 6: 最终验证并提交**

Run:

```powershell
rg -n "YOUR NAME|CONTACT PLACEHOLDER|VISUAL STUDY|PLACEHOLDER" src public CONTENT_INPUTS.md
npm run check
npm run test:e2e
git status --short
```

Expected: the placeholder scan finds only the explicitly documented seed content; all checks PASS; `output/qa/` is untracked or ignored and not staged.

```powershell
git add .gitignore e2e CONTENT_INPUTS.md README.md
git commit -m "test: verify immersive portfolio experience"
```

## 完成定义

实现只有在以下条件全部满足后才算完成：

- 暖白开场、双列作品墙、明暗入口、深色 3D 隧道、全屏查看器和极简收尾均可连续体验。
- 桌面默认 `HIGH`，声音默认关闭，访客可随时跳过 3D。
- 鼠标拖动有惯性且不破坏点击；滚动可以向前和向后。
- WebGL 或单个媒体失败时仍能浏览作品，不出现不可恢复黑屏。
- 1440×900 与 1920×1080 的 Chrome/Edge 自动流程与人工高清检查通过。
- 所有未提供的真实内容均保持明确占位，没有虚构项目、数据、客户或个人信息。
