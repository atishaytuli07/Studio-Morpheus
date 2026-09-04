// Dev-only: capture one URL across a set of viewports.
// node scripts/shot-sizes.mjs <url> <outPrefix> [waitMs]
import puppeteer from "puppeteer-core";

const [url = "http://localhost:3000", prefix = "shot", waitMs = "5000"] =
  process.argv.slice(2);

const SIZES = [
  { name: "desktop", w: 1600, h: 1000, mobile: false },
  { name: "laptop", w: 1280, h: 800, mobile: false },
  { name: "tablet", w: 820, h: 1180, mobile: true },
  { name: "phone", w: 390, h: 844, mobile: true },
  { name: "small", w: 320, h: 640, mobile: true },
  { name: "landscape", w: 740, h: 400, mobile: true },
];

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--disable-gpu", "--no-sandbox"],
});

for (const s of SIZES) {
  const page = await browser.newPage();
  await page.setViewport({
    width: s.w,
    height: s.h,
    isMobile: s.mobile,
    hasTouch: s.mobile,
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  } catch (e) {
    console.warn(s.name, "nav warning:", e.message);
  }
  await new Promise((r) => setTimeout(r, Number(waitMs)));

  // flag any horizontal overflow, the classic responsive failure
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    return {
      scrollW: de.scrollWidth,
      clientW: de.clientWidth,
      overflowing: de.scrollWidth > de.clientWidth + 1,
    };
  });

  await page.screenshot({ path: `${prefix}-${s.name}.png` });
  await page.close();
  console.log(
    `${s.name.padEnd(10)} ${s.w}x${s.h}  overflow: ${
      overflow.overflowing ? `YES (${overflow.scrollW} > ${overflow.clientW})` : "no"
    }`
  );
}

await browser.close();
