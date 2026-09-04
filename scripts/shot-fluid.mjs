// Dev-only: verify the wordmark liquid effect renders and reacts to the
// pointer. node scripts/shot-fluid.mjs <out-prefix>
import puppeteer from "puppeteer-core";
import { existsSync } from "fs";

const OUT = process.argv[2] || "fluid";

const exe = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].find((p) => existsSync(p));

const browser = await puppeteer.launch({
  executablePath: exe,
  headless: "new",
  // the effect needs a real GL context, so no --disable-gpu here
  args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000 });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));

await page.goto("http://localhost:3000/new", { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 9000));

const state = await page.evaluate(() => {
  const wrap = document.querySelector(".h2-wordmark");
  const canvas = document.querySelector(".h2-wordmark-canvas");
  return {
    isFluid: wrap?.classList.contains("is-fluid") ?? false,
    hasCanvas: !!canvas,
    canvasSize: canvas ? `${canvas.width}x${canvas.height}` : null,
    svgHidden: canvas
      ? getComputedStyle(document.querySelector(".h2-wordmark-svg")).visibility
      : null,
  };
});
console.log("STATE:", JSON.stringify(state));

await page.screenshot({ path: `${OUT}-rest.png` });

// sweep the pointer across the wordmark to pump the velocity field
const box = await page.evaluate(() => {
  const r = document.querySelector(".h2-wordmark-svg").getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
});
const midY = box.y + box.h * 0.55;
for (let i = 0; i <= 30; i++) {
  await page.mouse.move(box.x + (box.w * i) / 30, midY);
  await new Promise((r) => setTimeout(r, 16));
}
await page.screenshot({ path: `${OUT}-swept.png` });

console.log("ERRORS:", errs.slice(0, 5).join(" | ") || "none");
await browser.close();
