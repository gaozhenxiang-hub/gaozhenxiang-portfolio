import { expect, test } from "@playwright/test";

test("gallery renders and responds to wheel and pointer drag", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Selected Projects" })).toBeVisible();
  await expect(page.getByTestId("project-card")).toHaveCount(12);

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

  await page.mouse.move(760, 650);
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

  const heading = page.getByRole("heading", { name: "Selected Projects" });
  const firstCard = page.getByTestId("project-card").first();
  const headingBox = await heading.boundingBox();
  const cardBox = await firstCard.boundingBox();

  expect(headingBox?.y).toBeGreaterThanOrEqual(75);
  expect(headingBox?.y).toBeLessThanOrEqual(110);
  expect(cardBox?.y).toBeGreaterThanOrEqual(250);
  expect(cardBox?.y).toBeLessThanOrEqual(295);
});

test("curled cards remain rendered beneath the protected title area", async ({ page }) => {
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
