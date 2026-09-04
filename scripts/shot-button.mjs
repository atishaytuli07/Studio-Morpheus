// Dev-only: close-up of the nav CTA, normal + hover state.
import puppeteer from "puppeteer-core";

const OUT = process.argv[2] || "cta";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--disable-gpu", "--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000/new", { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 5000));

const el = await page.$(".h2-cta");
const box = await el.boundingBox();
const clip = {
  x: box.x - 30,
  y: box.y - 30,
  width: box.width + 60,
  height: box.height + 60,
};

await page.screenshot({ path: `${OUT}-normal.png`, clip });

await page.hover(".h2-cta");
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: `${OUT}-hover.png`, clip });

await browser.close();
console.log("saved", `${OUT}-normal.png`, `${OUT}-hover.png`);
