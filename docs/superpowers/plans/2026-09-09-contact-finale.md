# Contact Finale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen white contact poster after the final project row, reachable with the gallery's existing wheel and drag interaction.

**Architecture:** Store the approved personal information in `siteContent`, render it through a focused `ContactFinale` component placed as the final full-width row of the moving metadata grid, and calculate the shared motion boundary from the grid's full height. The finale moves with the same CSS gallery offset, so it is reversible and requires no second scrolling system.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest, Testing Library, Playwright.

---

### Task 1: Add verified personal contact content

**Files:**
- Modify: `src/content/site.test.ts`
- Modify: `src/content/site.ts`

- [ ] **Step 1: Write the failing content assertions**

Replace placeholder assertions with exact approved content:

```ts
expect(siteContent.name).toBe("高振翔");
expect(siteContent.tagline).toBe("AIGC CREATOR");
expect(siteContent.phone).toBe("13293941800");
expect(siteContent.email).toBe("13293941800@163.com");
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/content/site.test.ts`

Expected: FAIL because the current module still contains `YOUR NAME`, has no phone, and keeps email null.

- [ ] **Step 3: Add the approved content**

```ts
export const siteContent = {
  name: "高振翔",
  tagline: "AIGC CREATOR",
  phone: "13293941800",
  email: "13293941800@163.com",
  resumeHref: null as string | null,
  socials: [] as Array<{ label: string; href: string }>,
} as const;
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/content/site.test.ts`

Expected: all site content tests pass.

### Task 2: Make the gallery boundary explicitly include the finale

**Files:**
- Modify: `src/features/gallery/gallery-motion.test.ts`
- Modify: `src/features/gallery/gallery-motion.ts`
- Modify: `src/features/gallery/useDragGallery.ts`

- [ ] **Step 1: Write the failing boundary test**

Import `calculateGalleryMaximum` and assert both a tall finale-inclusive grid and a short grid:

```ts
expect(calculateGalleryMaximum(262, 5200, 900)).toBe(4610);
expect(calculateGalleryMaximum(262, 500, 900)).toBe(0);
```

- [ ] **Step 2: Run the motion test and verify RED**

Run: `npm test -- src/features/gallery/gallery-motion.test.ts`

Expected: FAIL because `calculateGalleryMaximum` is not exported.

- [ ] **Step 3: Implement and wire the boundary function**

```ts
export function calculateGalleryMaximum(
  contentTop: number,
  contentHeight: number,
  viewportHeight: number,
) {
  return Math.max(0, contentTop + contentHeight - viewportHeight + 48);
}
```

Use it in `useDragGallery` with the metadata grid's `offsetTop`, `scrollHeight`, and `window.innerHeight`.

- [ ] **Step 4: Run the focused motion test and verify GREEN**

Run: `npm test -- src/features/gallery/gallery-motion.test.ts`

Expected: all gallery motion tests pass.

### Task 3: Render the full-screen contact poster

**Files:**
- Create: `src/features/contact/ContactFinale.tsx`
- Create: `src/features/contact/contact-finale.css`
- Modify: `src/features/gallery/GalleryPage.test.tsx`
- Modify: `src/features/gallery/GalleryPage.tsx`
- Modify: `e2e/gallery.spec.ts`

- [ ] **Step 1: Write the failing component and browser assertions**

In `GalleryPage.test.tsx`, assert the finale, exact text, and link destinations:

```tsx
expect(screen.getByTestId("contact-finale")).toBeVisible();
expect(screen.getByRole("heading", { name: "高振翔" })).toBeVisible();
expect(screen.getByRole("link", { name: /电话 13293941800/ })).toHaveAttribute(
  "href",
  "tel:13293941800",
);
expect(screen.getByRole("link", { name: /邮箱 13293941800@163.com/ })).toHaveAttribute(
  "href",
  "mailto:13293941800@163.com",
);
```

Add a browser test that wheels to the bottom with `page.mouse.wheel(0, 10000)`, waits for smoothing, asserts the contact heading and links are visible, then wheels upward and confirms the projects return.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- src/features/gallery/GalleryPage.test.tsx; npx playwright test e2e/gallery.spec.ts --project=chrome-1440 --grep "contact finale"`

Expected: both commands FAIL because the contact finale does not exist.

- [ ] **Step 3: Create the focused component**

Render one semantic `footer` with a large `h2`, the role, and two clickable contact lines sourced only from `siteContent`. Import `contact-finale.css` from the component.

- [ ] **Step 4: Place it after the project cards**

Append `<ContactFinale />` after the `projects.map(...)` block inside `.gallery-grid--metadata`, making it the final full-width grid row.

- [ ] **Step 5: Style the poster**

Use `grid-column: 1 / -1`, `position: relative`, `left: 50%`, `width: 100vw`, `min-height: calc(100vh + 48px)`, `transform: translateX(-50%)`, white background, black type, and no cards/borders/shadows. Set the name with `font-size: clamp(92px, 13vw, 220px)` and place the two contact links in a bottom horizontal row with generous page margins.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run: `npm test -- src/features/gallery/GalleryPage.test.tsx; npx playwright test e2e/gallery.spec.ts --project=chrome-1440 --grep "contact finale"`

Expected: the GalleryPage component tests and contact-finale browser test pass.

### Task 4: Verify the real end-to-end transition

**Files:**
- Modify: `e2e/visual-capture.spec.ts`
- Modify: `design-qa.md`

- [ ] **Step 1: Add the finale visual capture**

Add an opt-in capture named `gallery-contact-finale-${testInfo.project.name}.png` after wheeling to the bottom and waiting for the motion to settle.

- [ ] **Step 2: Run the complete automated gate**

Run: `npm run lint && npm test && npm run build`

Expected: lint exits with no errors, every Vitest test passes, and the production build exits `0`.

- [ ] **Step 3: Run Chrome and Edge interaction coverage**

Run: `npx playwright test e2e/gallery.spec.ts --project=chrome-1440 --project=edge-1080p --project=chrome-recording-reference`

Expected: every gallery/contact interaction test passes in all three desktop projects.

- [ ] **Step 4: Run and inspect the visual capture suite**

Run: `$env:CAPTURE_QA='1'; try { npx playwright test e2e/visual-capture.spec.ts --project=chrome-1440 --project=edge-1080p --project=chrome-recording-reference; exit $LASTEXITCODE } finally { Remove-Item Env:CAPTURE_QA -ErrorAction SilentlyContinue }`

Expected: gallery states plus the new contact finale are captured for all three desktop projects. Inspect the matched Chrome capture for clean white/black hierarchy, readable spacing, and absence of cards, borders, or decorative clutter.

- [ ] **Step 5: Update QA evidence and commit**

Record the contact finale capture, browser results, exact content, typography, layout, colors, links, and any iteration history in `design-qa.md`. Use `final result: passed` only with no remaining P0/P1/P2 issue. Commit source, tests, plan correction, and QA report while keeping `output/` untracked.
