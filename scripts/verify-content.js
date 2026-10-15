const { chromium } = require("playwright");
const B = "http://localhost:3100";

(async () => {
  const b = await chromium.launch();
  const pass = [], fail = [];
  const ck = (n, c, e = "") => (c ? pass : fail).push(n + (e ? " :: " + e : ""));
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });

  /* ---- ABOUT: the timeline renders from JOURNEY and links into the Journal */
  {
    const p = await ctx.newPage();
    await p.goto(B + "/about", { waitUntil: "networkidle" });
    const steps = await p.locator(".road .step").count();
    ck("about: 8 journey steps", steps === 8, String(steps));
    ck("about: 4 major markers", (await p.locator(".step.is-major").count()) === 4);
    const href = await p.locator('.step a[href*="testimony"]').getAttribute("href");
    ck("about: testimony link targets the blog hash",
      href === "/blog#testimony-words-gave-courage", href);
    // the rail marker must be the Deep variant: plain Amber is 1.9:1 on Ivory
    const dot = await p.locator(".step.is-major").first().evaluate((el) =>
      getComputedStyle(el, "::before").backgroundColor);
    ck("about: major marker uses Amber Deep", dot === "rgb(198, 118, 13)", dot);
    ck("about: no em dash anywhere",
      !(await p.evaluate(() => document.body.innerText.includes("—"))));
    await p.close();
  }

  /* ---- BLOG: lone card keeps card width, expands in place, caps its measure */
  {
    const p = await ctx.newPage();
    await p.goto(B + "/blog", { waitUntil: "networkidle" });
    const closed = await p.locator(".journal-grid article").first().evaluate(
      (el) => el.getBoundingClientRect().width);
    ck("blog: lone card is card width, not full grid", closed < 520, Math.round(closed) + "px");

    await p.locator("button", { hasText: "Read the full article" }).click();
    await p.waitForTimeout(250);
    const open = await p.locator(".journal-grid article").first().evaluate(
      (el) => el.getBoundingClientRect().width);
    ck("blog: open card takes the row", open > 900, Math.round(open) + "px");

    const measure = await p.locator(".journal-grid article p").nth(1).evaluate(
      (el) => el.getBoundingClientRect().width);
    ck("blog: open body stays inside 68ch", measure < 760, Math.round(measure) + "px");
    ck("blog: aria-expanded flips", await p.locator('button[aria-expanded="true"]').count() === 1);

    // filter to a category with nothing in it
    await p.locator('button[aria-pressed]', { hasText: "Craft" }).click();
    await p.waitForTimeout(200);
    ck("blog: empty state appears", await p.locator("text=Nothing matched that").isVisible());
    await p.close();
  }

  /* ---- The About link must land the reader IN the article, not on a card */
  {
    const p = await ctx.newPage();
    await p.goto(B + "/blog#testimony-words-gave-courage", { waitUntil: "networkidle" });
    await p.waitForTimeout(600);
    ck("deep link: article arrives open",
      await p.locator('button[aria-expanded="true"]').count() === 1);
    const top = await p.locator("#testimony-words-gave-courage").evaluate(
      (el) => el.getBoundingClientRect().top);
    // sticky header is ~77px; scroll-mt-[104px] must clear it
    ck("deep link: title clears the sticky header", top > 70, Math.round(top) + "px");
    await p.close();
  }

  /* ---- CONTACT: our own validation, announced, focused, and reversible */
  {
    const p = await ctx.newPage();
    await p.goto(B + "/contact", { waitUntil: "networkidle" });
    ck("contact: booking fields show by default",
      await p.locator("#cd").isVisible());
    await p.locator(".pick", { hasText: "General" }).click();
    await p.waitForTimeout(150);
    ck("contact: booking fields hide for General",
      await p.locator("#cd").count() === 0);

    await p.locator('button[type="submit"]').click();
    await p.waitForTimeout(200);
    ck("contact: three errors shown", await p.locator("p[id$='-err']").count() === 3);
    ck("contact: first invalid field is focused",
      await p.evaluate(() => document.activeElement?.getAttribute("name")) === "name");
    ck("contact: error is tied to its field",
      await p.locator('#cn[aria-describedby="cn-err"][aria-invalid="true"]').count() === 1);

    await p.fill("#cn", "Ama"); await p.fill("#ce", "ama@example.com");
    await p.fill("#cm", "Would love to book Floks for our youth camp.");
    await p.locator('button[type="submit"]').click();
    await p.waitForTimeout(300);
    // no endpoint configured in this build, so it must say so rather than fake a send
    ck("contact: honest failure, not a fake success",
      await p.locator('main [role="alert"]').isVisible());
    ck("contact: offers the direct address",
      await p.locator('a[href^="mailto:"]').count() >= 1);
    await p.close();
  }

  /* ---- CONTACT: the social row is ink, the footer on the SAME page is light.
          This is the v30 defect's exact shape, so it gets its own check. */
  {
    const p = await ctx.newPage();
    await p.goto(B + "/contact", { waitUntil: "networkidle" });
    const row = await p.locator('main svg, section svg').last().evaluate(() => {
      const a = document.querySelector('[data-surface="ink"] svg');
      const f = document.querySelector('footer [data-surface="dark"] svg');
      return [getComputedStyle(a).fill, getComputedStyle(f).fill];
    });
    // Tailwind emits oklab, so compare lightness rather than matching a string
    const L = (c) => parseFloat(c.match(/oklab\(([\d.]+)/)?.[1] ?? (/^rgba?\((\d+)/.test(c) ? String(+c.match(/\d+/)[0] / 255) : "0.5"));
    ck("contact: page socials are ink", L(row[0]) < 0.4, row[0]);
    ck("contact: footer socials stay light", L(row[1]) > 0.8, row[1]);
    await p.close();
  }

  /* ---- HOME: latest is derived from publishedAt, not a frozen list */
  {
    const p = await ctx.newPage();
    await p.goto(B + "/", { waitUntil: "networkidle" });
    const titles = await p.locator("section:nth-of-type(3) article h3").allInnerTexts();
    ck("home: latest three are the newest three",
      titles.join("|") === "Away For A While|Master What You Do|I Wish I Were",
      titles.join("|"));
    ck("home: four theme tiles", await p.locator('a[href^="/listen#"]').count() === 4);
    ck("home: four merch photos", await p.locator('img[src*="merch-"]').count() === 4);
    ck("home: shop link opens WhatsApp in a new tab",
      await p.locator('main a[href*="wa.me"][target="_blank"][rel="noopener"]').count() >= 1);
    await p.close();
  }

  /* ---- LISTEN: filter and search narrow together */
  {
    const p = await ctx.newPage();
    await p.goto(B + "/listen", { waitUntil: "networkidle" });
    ck("listen: 8 recordings", await p.locator("article").count() >= 8);
    await p.locator('button[aria-pressed]', { hasText: "Identity" }).click();
    await p.waitForTimeout(200);
    const n = await p.locator('[role="status"]').innerText();
    ck("listen: count is announced and narrows", /2 recordings in Identity/.test(n), n);
    await p.close();
  }

  /* ---- Mobile: the ported sections must not introduce a sideways scroll */
  {
    const m = await b.newContext({ viewport: { width: 360, height: 780 } });
    for (const r of ["/", "/about", "/blog", "/contact", "/privacy", "/terms", "/listen"]) {
      const p = await m.newPage();
      await p.goto(B + r, { waitUntil: "networkidle" });
      const over = await p.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth + 1);
      ck(`360px ${r}: no sideways scroll`, !over);
      await p.close();
    }
    await m.close();
  }

  await b.close();
  console.log("PASS " + pass.length + (fail.length ? "   FAIL " + fail.length : ""));
  fail.forEach((f) => console.log("  XX " + f));
})();
