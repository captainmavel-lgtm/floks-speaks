/* Text sitting on a photograph cannot be measured from CSS: the background is
   whatever the picture happens to be behind each glyph. So: screenshot the
   page with the text hidden, then sample the real pixels inside each glyph's
   rectangle from Range.getClientRects (not the element's block box, which
   spans the whole container and sweeps in pixels no glyph touches).
   Reported against the worst pixel under the text, not the average. */
const { chromium } = require("playwright");
const { PNG } = require("pngjs");

const srgb = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => { const [x, y] = a > b ? [a, b] : [b, a]; return (x + 0.05) / (y + 0.05); };

const TARGETS = [
  ["/", ".hero-copy .text-eyebrow, .hero-copy h1, .hero-copy p, .hero-copy a"],
  ["/listen", ".lib-hero h1, .lib-hero p"],
];

(async () => {
  const b = await chromium.launch();
  let worstAll = Infinity, bad = [];
  for (const [route, sel] of TARGETS) {
    for (const [w, h] of [[1920, 1080], [1440, 900], [1280, 800], [390, 844]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const p = await ctx.newPage();
      await p.goto("http://localhost:3100" + route, { waitUntil: "networkidle" });
      await p.waitForTimeout(500);

      const boxes = await p.evaluate((sel) => {
        const out = [];
        for (const el of document.querySelectorAll(sel)) {
          const cs = getComputedStyle(el);
          for (const node of el.childNodes) {
            if (node.nodeType !== 3 || !node.textContent.trim()) continue;
            const r = document.createRange(); r.selectNodeContents(node);
            for (const rect of r.getClientRects()) {
              if (rect.width < 4 || rect.height < 4) continue;
              out.push({
                x: rect.x, y: rect.y, w: rect.width, h: rect.height,
                color: cs.color, px: parseFloat(cs.fontSize),
                bold: +cs.fontWeight >= 700,
                text: node.textContent.trim().slice(0, 34),
              });
            }
          }
        }
        return out;
      }, sel);

      // hide the text, keep the photograph and every overlay exactly as it is
      await p.addStyleTag({ content: `${sel} { color: transparent !important; }` });
      await p.waitForTimeout(150);
      const png = PNG.sync.read(await p.screenshot({ clip: { x: 0, y: 0, width: w, height: Math.min(h, 900) } }));

      for (const t of boxes) {
        if (t.y + t.h > png.height || t.y < 0) continue;
        const fg = t.color.match(/\d+/g).map(Number);
        const fl = lum(fg[0], fg[1], fg[2]);
        let worst = Infinity;
        for (let y = Math.max(0, Math.ceil(t.y)); y < Math.min(png.height, t.y + t.h); y += 2) {
          for (let x = Math.max(0, Math.ceil(t.x)); x < Math.min(png.width, t.x + t.w); x += 2) {
            const i = (png.width * y + x) << 2;
            const r = ratio(fl, lum(png.data[i], png.data[i + 1], png.data[i + 2]));
            if (r < worst) worst = r;
          }
        }
        const need = (t.px >= 24 || (t.bold && t.px >= 18.66)) ? 3 : 4.5;
        worstAll = Math.min(worstAll, worst / need);
        if (worst < need) bad.push(`${route} ${w}x${h}  ${worst.toFixed(2)}:1 (need ${need})  "${t.text}"`);
      }
      await ctx.close();
    }
  }
  await b.close();
  bad.forEach((x) => console.log("  XX " + x));
  console.log(bad.length ? `${bad.length} over-image failures` : "Over-image text clears AA at every size tested");
})();
