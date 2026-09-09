import { expect, test } from "@playwright/test";

test("capture the desktop gallery for visual comparison", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
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

test("capture a project row receding toward the vanishing point", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");

  await page.goto("/");
  await expect(page.getByTestId("gallery-stage")).toHaveClass(/webgl-ready/);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(650);
  await page.screenshot({
    path: `output/qa/gallery-depth-${testInfo.project.name}.png`,
    fullPage: false,
  });
});
