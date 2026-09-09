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
});
