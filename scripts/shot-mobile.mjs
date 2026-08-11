// Dev-only mobile visual check: node scripts/shot-mobile.mjs <url> <out> [waitMs] [scrollY]
import puppeteer from "puppeteer-core";

const [url = "http://localhost:3000", out = "shot.png", waitMs = "6000", scrollY = "0"] =
  process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--disable-gpu", "--no-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({
  width: 390,
  height: 844,
  isMobile: true,
  hasTouch: true,
});
try {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
} catch (e) {
  console.warn("nav warning:", e.message);
}
await new Promise((r) => setTimeout(r, Math.min(Number(waitMs), 6000)));

// Lenis ignores window.scrollTo — drive it with real wheel events so
// ScrollTrigger and any pinned sections advance.
if (Number(scrollY) > 0) {
  const target = Number(scrollY);
  await page.mouse.move(195, 400);
  for (let i = 0; i < 400; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y >= target - 30) break;
    await page.mouse.wheel({ deltaY: Math.min(600, target - y) });
    await new Promise((r) => setTimeout(r, 40));
  }
  await new Promise((r) => setTimeout(r, 1200));
}

await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: out });
await browser.close();
console.log("saved", out);
