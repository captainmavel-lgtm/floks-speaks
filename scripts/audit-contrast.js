/* WCAG 1.4.3 and 1.4.11 audit for the Next build.

   Method, unchanged from the v30 pass that found six real defects:
     - walk the rendered DOM, not the token file. A token audit passes a
       component that resolves to the wrong token.
     - resolve each element's background by climbing until an opaque colour is
       found, compositing every translucent layer on the way.
     - for a text node, measure the glyph rectangles with Range.getClientRects,
       not the element's block box: a <p> box spans the whole container and
       sweeps in pixels where no glyph sits, which is what produced three
       false alarms the first time.
     - large text is >=24px, or >=18.66px when bold (3:1 rather than 4.5:1).
*/
const { chromium } = require("playwright");
const B = "http://localhost:3100";

const AUDIT = require("./audit-body.js");


(async () => {
  const b = await chromium.launch();
  const routes = ["/", "/listen", "/blog", "/about", "/contact", "/privacy", "/terms"];
  let total = 0;
  for (const r of routes) {
    for (const [w, h, t] of [[1440, 900, "desk"], [390, 844, "ph"]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      await p.goto(B + r, { waitUntil: "networkidle" });
      await p.waitForTimeout(300);
      const found = await p.evaluate(AUDIT);
      // de-duplicate: one component repeated eight times is one defect
      const seen = new Map();
      for (const f of found) seen.set(f.sel + f.color + f.bg + f.kind, f);
      if (seen.size) {
        console.log(`\n${r} ${t}`);
        for (const f of seen.values()) {
          total++;
          console.log(`  ${f.kind}  ${f.got}:1 (need ${f.need})  ${f.sel}  ${f.color} on ${f.bg}  "${f.sample}"`);
        }
      }
      await ctx.close();
    }
  }
  await b.close();
  console.log(total ? `\n${total} to look at` : "\nNo measurable contrast failures");
})();
