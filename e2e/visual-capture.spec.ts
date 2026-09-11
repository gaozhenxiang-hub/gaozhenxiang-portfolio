import { expect, test, type Page } from "@playwright/test";

async function enterGallery(page: Page) {
  const experience = page.getByTestId("portfolio-experience");
  await expect(experience).toHaveClass(/hero-webgl-ready/);
  const height = page.viewportSize()?.height ?? 900;
  await page.mouse.wheel(0, height / 0.92 + 2);
  await expect(experience).toHaveAttribute("data-phase", "gallery");
}

test("capture the cover at rest and during pointer response", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("portfolio-experience")).toHaveClass(/hero-webgl-ready/);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `output/qa/hero-rest-${testInfo.project.name}.png`,
    fullPage: false,
  });

  await page.mouse.move(980, 640);
  await page.mouse.move(1160, 430, { steps: 8 });
  await page.waitForTimeout(24);
  await page.screenshot({
    path: `output/qa/hero-pointer-${testInfo.project.name}.png`,
    fullPage: false,
  });

  await page.mouse.wheel(0, 500);
  await expect
    .poll(() =>
      page.getByTestId("portfolio-experience").evaluate((element) =>
        Number(getComputedStyle(element).getPropertyValue("--hero-progress")),
      ),
    )
    .toBeGreaterThan(0.25);
  await page.screenshot({
    path: `output/qa/hero-transition-${testInfo.project.name}.png`,
    fullPage: false,
  });
});

test("capture the desktop gallery for visual comparison", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await enterGallery(page);
  await page.waitForTimeout(400);

  await page.screenshot({
    path: `output/qa/gallery-${testInfo.project.name}.png`,
    fullPage: false,
  });
  await page.waitForTimeout(1400);
  await page.screenshot({
    path: `output/qa/gallery-rest-later-${testInfo.project.name}.png`,
    fullPage: false,
  });
});

test("capture the active drag deformation", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await enterGallery(page);
  await page.mouse.move(730, 690);
  await page.mouse.down();
  await page.mouse.move(730, 270, { steps: 5 });
  await page.waitForTimeout(32);
  await page.screenshot({
    path: `output/qa/gallery-drag-${testInfo.project.name}.png`,
    fullPage: false,
  });
  await page.mouse.up();
});

test("capture the pointer-velocity image response without dragging", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await enterGallery(page);
  await page.mouse.move(360, 730);
  await page.mouse.move(510, 520, { steps: 10 });
  await page.waitForTimeout(16);
  await page.screenshot({
    path: `output/qa/gallery-pointer-motion-${testInfo.project.name}.png`,
    fullPage: false,
  });
});

test("capture a project row receding toward the vanishing point", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await enterGallery(page);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(650);
  await page.screenshot({
    path: `output/qa/gallery-depth-${testInfo.project.name}.png`,
    fullPage: false,
  });
});

test("capture the contact finale", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await enterGallery(page);
  await page.mouse.wheel(0, 10000);
  await page.waitForTimeout(1600);
  await expect(
    page.getByTestId("contact-finale").getByRole("heading", { name: "高振翔" }),
  ).toBeInViewport();
  await page.screenshot({
    path: `output/qa/gallery-contact-finale-${testInfo.project.name}.png`,
    fullPage: false,
  });
});

test("capture idle and active video project states", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await enterGallery(page);
  const card = page.getByTestId("project-card").nth(12);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const box = await card.boundingBox();
    if (box && box.y > 160 && box.y < 650) break;
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(220);
  }

  await page.mouse.move(12, 12);
  await page.waitForTimeout(250);
  await page.screenshot({
    path: `output/qa/gallery-video-idle-${testInfo.project.name}.png`,
    fullPage: false,
  });

  await page.waitForTimeout(1200);
  const mediaBox = await card.locator(".project-media").boundingBox();
  expect(mediaBox).not.toBeNull();
  await page.mouse.move(
    mediaBox!.x + mediaBox!.width / 2,
    mediaBox!.y + mediaBox!.height / 2,
  );
  const video = card.locator("video");
  await expect
    .poll(() => video.evaluate((node) => (node as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0.2);
  await page.screenshot({
    path: `output/qa/gallery-video-active-${testInfo.project.name}.png`,
    fullPage: false,
  });
});

test("capture the two newly added video projects", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await enterGallery(page);
  const card = page.getByTestId("project-card").nth(23);
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const box = await card.boundingBox();
    if (box && box.y > 160 && box.y < 650) break;
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(220);
  }

  await expect(card.getByText("Comic Drama Study")).toBeVisible();
  await page.mouse.move(12, 12);
  await page.waitForTimeout(250);
  await page.screenshot({
    path: `output/qa/gallery-new-video-row-idle-${testInfo.project.name}.png`,
    fullPage: false,
  });

  await page.waitForTimeout(1200);
  const mediaBox = await card.locator(".project-media").boundingBox();
  expect(mediaBox).not.toBeNull();
  await page.mouse.move(
    mediaBox!.x + mediaBox!.width / 2,
    mediaBox!.y + mediaBox!.height / 2,
  );
  await expect
    .poll(() => card.locator("video").evaluate((node) => (node as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0.2);
  await page.screenshot({
    path: `output/qa/gallery-new-video-row-active-${testInfo.project.name}.png`,
    fullPage: false,
  });
});
