import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--disable-gpu", "--no-sandbox"],
});
const page = await browser.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning")
    errs.push(m.type() + ": " + m.text());
});
await page.setViewport({ width: 1600, height: 1000 });
await page.goto("http://localhost:3000/new", { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 6000));

const state = await page.evaluate(() => {
  const letter = document.querySelector(".h2-letter");
  return {
    letterTransform: letter ? getComputedStyle(letter).transform : null,
    letterInlineStyle: letter?.getAttribute("style") || "(none)",
  };
});
console.log("STATE:", JSON.stringify(state));
console.log(errs.slice(0, 10).join("\n") || "no console errors");
await browser.close();
