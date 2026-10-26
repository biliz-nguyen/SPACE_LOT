import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const name = process.argv[2] || "after";
const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route("https://**/*", (route) => route.abort());
await mkdir("artifacts/screenshots", { recursive: true });
for (const [label, width, height] of [
  ["desktop", 1440, 900],
  ["compact", 1280, 800],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
]) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:5173/");
  await page.locator("#scene-status").filter({ hasText: "parts" }).waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({
    path: `artifacts/screenshots/${name}-${label}.png`,
    fullPage: true,
  });
  console.log(
    label,
    await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      canvases: document.querySelectorAll("#three-container canvas").length,
    })),
  );
  if (label === "desktop") {
    await page.locator("#import-btn").click();
    await page.locator("#asset-studio").evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished),
      );
    });
    await page.screenshot({ path: `artifacts/screenshots/${name}-import.png` });
    await page.keyboard.press("Escape");
  }
}
console.log("Page errors:", errors);
await browser.close();
if (errors.length) process.exitCode = 1;
