import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("https://**/*", (route) => route.abort());
await page.goto("http://127.0.0.1:4173/");
await expect(page.locator("#instance-count")).toHaveText("18 PARTS");
await expect(page.locator("#three-container canvas")).toHaveCount(1);
await page.locator("#import-btn").click();
await page.locator("#asset-files").setInputFiles("tests/fixtures/cube.step");
await page.locator("#process-files").click();
await expect(page.locator(".stage-item")).toContainText("300 × 300 × 300", {
  timeout: 60000,
});
await expect(page.locator("#save-import")).toBeDisabled();
await page.locator("#confirm-import").check();
await page.locator("#save-import").click();
await expect(page.locator("#local-assets")).toContainText("cube");
await page.locator("[data-insert]").first().click();
await expect(page.locator("#selected-content")).toContainText("cube");
await expect(page.locator("#mass-value")).toContainText("+ ?");
await page.reload();
await expect(page.locator("#asset-shelf")).toContainText("cube");
await mkdir("artifacts/screenshots", { recursive: true });
await page.screenshot({
  path: "artifacts/screenshots/production-step-roundtrip.png",
  fullPage: true,
});
expect(errors).toEqual([]);
console.log(
  "Production build: STEP worker → dimensions → consent → IndexedDB → scene → reload passed.",
);
await browser.close();
