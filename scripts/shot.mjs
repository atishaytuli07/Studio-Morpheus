// Dev-only visual check: node scripts/shot.mjs <url> <outfile> [waitMs] [scrollY]
import puppeteer from "puppeteer-core";

const [url = "http://localhost:3000", out = "shot.png", waitMs = "6000", scrollY = "0", clickSel = ""] =
  process.argv.slice(2);

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const { existsSync } = await import("fs");
const executablePath = CHROME_PATHS.find((p) => existsSync(p));

const browser = await puppeteer.launch({
  executablePath,
  headless: "new",
  args: ["--disable-gpu", "--no-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000 });
try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
} catch (e) {
  console.warn("nav warning:", e.message);
}

// let intro animations settle before scrolling
await new Promise((r) => setTimeout(r, Math.min(Number(waitMs), 6000)));

// The page uses Lenis smooth scroll, which ignores window.scrollTo — drive it
// with real wheel events so ScrollTrigger (and any pinned sections) advance.
if (Number(scrollY) > 0) {
  const target = Number(scrollY);
  await page.mouse.move(800, 500);
  for (let i = 0; i < 300; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y >= target - 30) break;
    await page.mouse.wheel({ deltaY: Math.min(600, target - y) });
    await new Promise((r) => setTimeout(r, 40));
  }
  // allow smoothing + scrub to catch up
  await new Promise((r) => setTimeout(r, 1200));
}

await new Promise((r) => setTimeout(r, 800));

if (clickSel) {
  await page.click(clickSel);
  await new Promise((r) => setTimeout(r, 1500));
}

await page.screenshot({ path: out });
await browser.close();
console.log(`saved ${out}`);
