import { expect, test } from "@playwright/test";

test("gallery renders and responds to wheel and pointer drag", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Selected Works" })).toBeVisible();
  await expect(page.getByTestId("project-card")).toHaveCount(24);

  const stage = page.getByTestId("gallery-stage");
  await expect(stage).toHaveClass(/webgl-ready/);

  const before = await stage.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--gallery-y"),
  );

  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(300);

  const afterWheel = await stage.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--gallery-y"),
  );
  expect(afterWheel).not.toBe(before);

  await page.mouse.move(600, 700);
  await page.mouse.move(760, 650, { steps: 3 });
  await expect(stage).toHaveAttribute("data-pointer-active", "true");
  const pointerStrength = await stage.evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--pointer-strength")),
  );
  expect(pointerStrength).toBeGreaterThan(0);
  await page.waitForTimeout(500);
  await expect(stage).toHaveAttribute("data-pointer-active", "false");
  await page.mouse.down();
  await expect(stage).toHaveAttribute("data-dragging", "true");
  await page.mouse.move(760, 280, { steps: 8 });
  await page.mouse.up();
  await expect(stage).toHaveAttribute("data-dragging", "false");

  const afterDrag = await stage.evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--gallery-y"),
  );
  expect(afterDrag).not.toBe(afterWheel);
});

test("gallery starts at the captured desktop composition", async ({ page }) => {
  await page.goto("/");

  const heading = page.getByRole("heading", { name: "Selected Works" });
  const firstCard = page.getByTestId("project-card").first();
  const headingBox = await heading.boundingBox();
  const cardBox = await firstCard.boundingBox();

  expect(headingBox?.y).toBeGreaterThanOrEqual(75);
  expect(headingBox?.y).toBeLessThanOrEqual(110);
  expect(cardBox?.y).toBeGreaterThanOrEqual(250);
  expect(cardBox?.y).toBeLessThanOrEqual(295);
});

test("receding cards remain rendered beneath the protected title area", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("gallery-metadata-mask")).toHaveCount(0);
  const veil = page.getByTestId("gallery-top-veil");
  await expect(veil).toBeVisible();
  const veilStyle = await veil.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundImage: style.backgroundImage,
      height: element.getBoundingClientRect().height,
      zIndex: Number(style.zIndex),
    };
  });

  expect(veilStyle.backgroundImage).toContain("radial-gradient");
  expect(veilStyle.height).toBeGreaterThanOrEqual(180);
  expect(veilStyle.height).toBeLessThanOrEqual(240);
  expect(veilStyle.zIndex).toBeGreaterThan(1);
});

test("contact finale follows the projects and returns to the gallery", async ({ page }) => {
  await page.goto("/");

  const finale = page.getByTestId("contact-finale");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await expect(finale).not.toBeInViewport();

  await page.mouse.wheel(0, 10000);
  await page.waitForTimeout(1400);

  await expect(page.getByRole("heading", { name: "高振翔" })).toBeInViewport();
  await expect(page.getByRole("link", { name: /电话 13293941800/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /邮箱 13293941800@163.com/ })).toBeVisible();
  const finaleBox = await finale.boundingBox();
  expect(finaleBox?.y).toBeCloseTo(0, 0);
  expect(finaleBox?.height).toBeGreaterThanOrEqual(page.viewportSize()?.height ?? 0);

  await page.mouse.wheel(0, -10000);
  await page.waitForTimeout(1400);
  await expect(page.getByTestId("project-card").first()).toBeInViewport();
});

test("later projects play muted on hover and reset on exit", async ({ page }) => {
  await page.goto("/");
  const card = page.getByTestId("project-card").nth(23);

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const box = await card.boundingBox();
    if (box && box.y > 160 && box.y < 650) break;
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(220);
  }

  const media = card.locator(".project-media");
  await expect(card.getByText("Comic Drama Study")).toBeVisible();
  await expect(card.locator("video")).toHaveAttribute(
    "src",
    "/gallery/videos/comic-drama-study-01.mp4",
  );
  const mediaBox = await media.boundingBox();
  expect(mediaBox).not.toBeNull();
  await page.mouse.move(
    mediaBox!.x + mediaBox!.width / 2,
    mediaBox!.y + mediaBox!.height / 2,
  );

  const video = card.locator("video");
  await expect
    .poll(() =>
      video.evaluate((node) => {
        const element = node as HTMLVideoElement;
        return { paused: element.paused, muted: element.muted, loop: element.loop };
      }),
    )
    .toEqual({ paused: false, muted: true, loop: true });
  const startedAt = await video.evaluate((node) => (node as HTMLVideoElement).currentTime);
  await page.waitForTimeout(450);
  expect(await video.evaluate((node) => (node as HTMLVideoElement).currentTime)).toBeGreaterThan(
    startedAt,
  );

  await page.mouse.move(12, 12);
  await expect
    .poll(() =>
      video.evaluate((node) => {
        const element = node as HTMLVideoElement;
        return { paused: element.paused, time: element.currentTime };
      }),
    )
    .toEqual({ paused: true, time: 0 });
});
