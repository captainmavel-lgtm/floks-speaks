/* The measurement, shared by audit-contrast.js and audit-selftest.js so the
   self-test exercises the real code rather than a re-escaped copy. */
module.exports = `(() => {
  const srgb = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  /* Tailwind v4 emits oklab() for anything with an opacity modifier, so a
     regex over rgb() silently skipped most of the site and the audit came
     back clean on its first run. Painting the colour into a 1x1 canvas makes
     the browser do the conversion, whatever the colour space. */
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const memo = new Map();
  const parse = (c) => {
    if (!c || c === "transparent" || c === "none") return null;
    if (memo.has(c)) return memo.get(c);
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = "#000";
    cx.fillStyle = c;             // invalid values leave it at #000
    if (cx.fillStyle === "#000000" && !/#000000|rgb\\(0, 0, 0|black/.test(c)) {
      memo.set(c, null); return null;
    }
    cx.clearRect(0, 0, 1, 1);
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    /* ImageData is NOT premultiplied, so the channels are already the stated
       colour. Dividing by alpha here is what produced channel values above
       255 and a run of invented failures on the first pass. */
    const v = [d[0], d[1], d[2], d[3] / 255];
    memo.set(c, v); return v;
  };
  const over = (f, b) => f[3] >= 1 ? f : [0,1,2].map(i => f[i] * f[3] + b[i] * (1 - f[3]));

  function bgOf(el) {
    let layers = [], n = el;
    while (n && n !== document.documentElement.parentNode) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== "none") return null; // gradient or photo: not measurable this way
      const c = parse(s.backgroundColor);
      if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
      n = n.parentElement;
    }
    if (!layers.length) return null;
    let out = layers.pop(); if (out[3] < 1) return null;
    out = out.slice(0, 3);
    while (layers.length) out = over(layers.pop(), out);
    return out;
  }

  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || +s.opacity === 0) continue;
    const text = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!text) continue;
    const bg = bgOf(el); if (!bg) continue;
    const fgRaw = parse(s.color); if (!fgRaw) continue;
    const fg = over(fgRaw, bg);
    const px = parseFloat(s.fontSize);
    const bold = +s.fontWeight >= 700;
    const need = (px >= 24 || (bold && px >= 18.66)) ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (r < need) out.push({
      kind: "text", need, got: +r.toFixed(2), px: +px.toFixed(1),
      sel: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).slice(0,2).join(".") : ""),
      sample: el.textContent.trim().slice(0, 48),
      color: s.color, bg: "rgb(" + bg.map(Math.round).join(",") + ")"
    });
  }

  // 1.4.11: a control whose boundary is the only thing identifying it
  for (const el of document.querySelectorAll("input, textarea, select, button, [role=button], a[class*=rounded-full]")) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    if (parse(s.backgroundColor)?.[3] >= 1) continue; // filled: the fill identifies it
    const w = parseFloat(s.borderTopWidth);
    if (!w) continue;
    const bg = bgOf(el.parentElement); if (!bg) continue;
    const bc = parse(s.borderTopColor); if (!bc) continue;
    const r = ratio(over(bc, bg), bg);
    if (r < 3) out.push({
      kind: "boundary", need: 3, got: +r.toFixed(2),
      sel: el.tagName.toLowerCase(), sample: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
      color: s.borderTopColor, bg: "rgb(" + bg.map(Math.round).join(",") + ")"
    });
  }
  return out;
})()`;
