import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--disable-gpu", "--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000 });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto("http://localhost:3000/new", { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 5000));

const info = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("section").forEach((el) => {
    const r = el.getBoundingClientRect();
    out.push({
      cls: el.className.split(" ")[0],
      top: Math.round(r.top + window.scrollY),
      h: Math.round(r.height),
    });
  });
  const word = document.querySelector(".m2-word");
  return {
    sections: out,
    docH: document.documentElement.scrollHeight,
    wordOpacity: word ? getComputedStyle(word).opacity : null,
    wordFilter: word ? getComputedStyle(word).filter : null,
  };
});
console.log(JSON.stringify(info, null, 1));
console.log("ERRORS:", errs.slice(0, 4).join(" | ") || "none");
await browser.close();
