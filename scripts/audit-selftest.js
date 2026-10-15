/* Does the audit actually measure, or is it skipping and reporting clean?
   Counts what it looked at, then plants one element known to fail. */
const { chromium } = require("playwright");
const AUDIT = require("./audit-body.js");

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3100/about", { waitUntil: "networkidle" });

  const counted = await p.evaluate(() => {
    let text = 0, resolved = 0;
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    for (const el of document.querySelectorAll("body *")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      text++;
      let n = el, ok = false;
      while (n) {
        const s = getComputedStyle(n);
        if (s.backgroundImage !== "none") break;
        cx.clearRect(0, 0, 1, 1); cx.fillStyle = s.backgroundColor; cx.fillRect(0, 0, 1, 1);
        if (cx.getImageData(0, 0, 1, 1).data[3] === 255) { ok = true; break; }
        n = n.parentElement;
      }
      if (ok) resolved++;
    }
    return { text, resolved };
  });

  const before = (await p.evaluate(AUDIT)).length;
  await p.evaluate(() => {
    const d = document.createElement("p");
    d.textContent = "canary";
    d.style.cssText = "color:#8a8a8a;background:#f2ede5;font-size:14px";
    document.body.appendChild(d);
  });
  const after = await p.evaluate(AUDIT);

  console.log(`text-bearing elements on /about: ${counted.text}`);
  console.log(`of those, background resolved to opaque: ${counted.resolved}`);
  console.log(`failures before canary: ${before}, after: ${after.length}`);
  if (after.length > before) console.log("caught:", JSON.stringify(after.at(-1)));
  await b.close();
})();
