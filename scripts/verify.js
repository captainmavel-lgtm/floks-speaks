const { chromium } = require("playwright");

(async () => {
  const b = await chromium.launch();
  const pass = [], fail = [];
  const ck = (n, c, e = "") => (c ? pass : fail).push(n + (e ? " :: " + e : ""));
  const routes = ["/", "/listen", "/blog", "/about", "/contact", "/privacy", "/terms"];
  const light = new Set(["/blog", "/contact", "/privacy", "/terms"]);

  for (const r of routes) {
    for (const [w, h, t] of [[1440, 900, "desk"], [390, 844, "ph"]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      const errs = [];
      p.on("pageerror", (e) => errs.push(e.message.slice(0, 80)));
      const bad = [];
      p.on("response", (x) => {
        if (x.status() >= 400) bad.push(x.status() + " " + x.url().replace("http://localhost:3100", ""));
      });
      await p.goto("http://localhost:3100" + r, { waitUntil: "networkidle" });
      await p.waitForTimeout(400);
      const d = await p.evaluate(() => {
        const foot = document.querySelector("footer");
        const svg = foot.querySelector("svg");
        return {
          theme: document.body.dataset.theme,
          footBg: getComputedStyle(foot).backgroundColor,
          glyph: svg ? getComputedStyle(svg).fill : "none",
          socials: foot.querySelectorAll("a[aria-label]").length,
          over: document.documentElement.scrollWidth > window.innerWidth + 1,
          imgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
          navCurrent: document.querySelector('header a[aria-current="page"]')?.textContent || "",
        };
      });
      ck(`${r} ${t} theme`, d.theme === (light.has(r) ? "light" : "dark"), d.theme);
      ck(`${r} ${t} footer pinned midnight`, d.footBg === "rgb(17, 17, 22)", d.footBg);
      ck(`${r} ${t} footer glyphs light`, !/rgb\(17, 17, 22\)/.test(d.glyph), d.glyph);
      ck(`${r} ${t} 5 social links`, d.socials >= 5, String(d.socials));
      ck(`${r} ${t} no overflow`, !d.over);
      ck(`${r} ${t} no broken images`, d.imgs === 0, String(d.imgs));
      ck(`${r} ${t} no JS errors`, errs.length === 0, errs.join("|"));
      ck(`${r} ${t} no 4xx`, bad.length === 0, bad.join(" "));
      await ctx.close();
    }
  }

  // client-side nav keeps the layout mounted (player state will survive it)
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto("http://localhost:3100/", { waitUntil: "networkidle" });
    await p.evaluate(() => { window.__probe = "alive"; });
    await p.click('header a[href="/blog"]');
    await p.waitForTimeout(700);
    const survived = await p.evaluate(() => window.__probe === "alive");
    const theme = await p.evaluate(() => document.body.dataset.theme);
    ck("client nav does not full-reload", survived);
    ck("theme switches on client nav", theme === "light", theme);
    await ctx.close();
  }

  // reduced motion
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto("http://localhost:3100/", { waitUntil: "networkidle" });
    ck("reduced motion honoured", await p.evaluate(() =>
      getComputedStyle(document.documentElement).scrollBehavior === "auto"));
    await ctx.close();
  }

  await b.close();
  console.log("PASS " + pass.length + (fail.length ? "   FAIL " + fail.length : ""));
  fail.forEach((f) => console.log("  XX " + f));
})();
