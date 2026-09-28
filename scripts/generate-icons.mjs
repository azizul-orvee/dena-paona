/**
 * Generates the Dena-Paona brand mark and every icon asset from one source of
 * truth. Run with: npm run icons
 *
 * The mark is a circulation loop: two arrowed arcs chasing each other.
 * Teal arc = paona (money coming to you). Violet arc = dena (money you owe).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CX = 32;
const CY = 32;
const R = 19;

/** Half-widths: each arc tapers from a hairline tail into a solid head. */
const H_START = 0.55;
const H_END = 3.9;
const HEAD_HALF = 7.4;
const HEAD_LEN = 9.2;
const SAMPLES = 56;

const rad = (deg) => (deg * Math.PI) / 180;
const n = (v) => Number(v.toFixed(2));

/** Outward unit vector at a given angle (SVG y axis points down). */
const unit = (deg) => [Math.cos(rad(deg)), -Math.sin(rad(deg))];
/** Unit tangent for a clockwise sweep (decreasing angle). */
const tangent = (deg) => [Math.sin(rad(deg)), Math.cos(rad(deg))];

const at = (deg, radius) => {
  const [ux, uy] = unit(deg);
  return [CX + radius * ux, CY + radius * uy];
};

/**
 * A tapered, arrow-tipped arc swept clockwise from `a0` to `a1`.
 * The tail narrows to a point, which is what keeps the mark from reading as a
 * generic refresh glyph.
 */
function taperedArrowArc(a0, a1) {
  const outer = [];
  const inner = [];

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const deg = a0 + (a1 - a0) * t;
    const h = H_START + (H_END - H_START) * Math.pow(t, 0.72);
    outer.push(at(deg, R + h));
    inner.push(at(deg, R - h));
  }

  const [tx, ty] = tangent(a1);
  const [bx, by] = at(a1, R);
  const tip = [bx + tx * HEAD_LEN, by + ty * HEAD_LEN];
  const barbOuter = at(a1, R + HEAD_HALF);
  const barbInner = at(a1, R - HEAD_HALF);

  const line = (pts) => pts.map(([x, y]) => `L ${n(x)} ${n(y)}`).join(" ");

  return [
    `M ${n(outer[0][0])} ${n(outer[0][1])}`,
    line(outer.slice(1)),
    `L ${n(barbOuter[0])} ${n(barbOuter[1])}`,
    `L ${n(tip[0])} ${n(tip[1])}`,
    `L ${n(barbInner[0])} ${n(barbInner[1])}`,
    line(inner.slice().reverse()),
    "Z",
  ].join(" ");
}

// Deliberately unequal sweeps — the asymmetry is what makes the loop feel drawn
// rather than generated.
const paonaPath = taperedArrowArc(190, 35);
const denaPath = taperedArrowArc(-7, -178);

function markGuts(idPrefix) {
  return `
  <defs>
    <linearGradient id="${idPrefix}-paona" x1="10" y1="6" x2="54" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#9BF7D8"/>
      <stop offset="55%" stop-color="#43E0A8"/>
      <stop offset="100%" stop-color="#11B87E"/>
    </linearGradient>
    <linearGradient id="${idPrefix}-dena" x1="54" y1="58" x2="10" y2="24" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#C9BAFF"/>
      <stop offset="55%" stop-color="#9B84FF"/>
      <stop offset="100%" stop-color="#6544E8"/>
    </linearGradient>
  </defs>
  <path d="${paonaPath}" fill="url(#${idPrefix}-paona)"/>
  <path d="${denaPath}" fill="url(#${idPrefix}-dena)"/>`;
}

/** Bare mark on a transparent background. */
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Dena-Paona">
${markGuts("m")}
</svg>
`;

/** Mark inside the dark squircle badge — used for favicons and app icons. */
function badgeSvg({ size = 512, radiusRatio = 0.235, pad = 9 } = {}) {
  const r = (64 * radiusRatio).toFixed(2);
  const scale = (64 - pad * 2) / 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#171B2A"/>
      <stop offset="55%" stop-color="#0B0E18"/>
      <stop offset="100%" stop-color="#05060A"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.28" cy="0.2" r="0.85">
      <stop offset="0%" stop-color="#7C5CFF" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#7C5CFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" rx="${r}" ry="${r}" fill="url(#bg)"/>
  <rect width="64" height="64" rx="${r}" ry="${r}" fill="url(#glow)"/>
  <rect x="0.5" y="0.5" width="63" height="63" rx="${r}" ry="${r}" fill="none" stroke="#FFFFFF" stroke-opacity="0.09"/>
  <g transform="translate(${pad} ${pad}) scale(${scale.toFixed(4)})">
${markGuts("b")}
  </g>
</svg>
`;
}

/** Full-bleed variant for Android maskable icons (safe zone aware). */
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#171B2A"/>
      <stop offset="100%" stop-color="#05060A"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="url(#bg)"/>
  <g transform="translate(32 32) scale(0.62) translate(-32 -32)">
${markGuts("k")}
  </g>
</svg>
`;

const outputs = [
  ["public/mark.svg", markSvg],
  ["public/icon.svg", badgeSvg({ size: 512 })],
  ["src/app/icon.svg", badgeSvg({ size: 512 })],
];

const rasters = [
  ["src/app/apple-icon.png", badgeSvg({ size: 180, radiusRatio: 0.222, pad: 10 }), 180],
  ["public/favicon-32.png", badgeSvg({ size: 32, pad: 7 }), 32],
  ["public/icon-192.png", badgeSvg({ size: 192 }), 192],
  ["public/icon-512.png", badgeSvg({ size: 512 }), 512],
  ["public/icon-maskable-512.png", maskableSvg, 512],
  ["public/mark-512.png", markSvg, 512],
];

async function run() {
  for (const [rel, contents] of outputs) {
    const target = resolve(root, rel);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
    console.log("wrote", rel);
  }

  for (const [rel, svg, size] of rasters) {
    const target = resolve(root, rel);
    await mkdir(dirname(target), { recursive: true });
    await sharp(Buffer.from(svg), { density: 384 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(target);
    console.log("wrote", rel, `${size}x${size}`);
  }

  // Multi-resolution .ico for legacy browser chrome.
  const icoSizes = [16, 32, 48];
  const pngs = await Promise.all(
    icoSizes.map((s) =>
      sharp(Buffer.from(badgeSvg({ size: s, pad: s <= 16 ? 5 : 7 })), { density: 384 })
        .resize(s, s)
        .png()
        .toBuffer(),
    ),
  );
  await writeFile(resolve(root, "src/app/favicon.ico"), buildIco(icoSizes, pngs));
  console.log("wrote src/app/favicon.ico");
}

/** Minimal ICO container wrapping PNG frames. */
function buildIco(sizes, pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);

  let offset = 6 + sizes.length * 16;
  const dir = [];
  for (let i = 0; i < sizes.length; i++) {
    const e = Buffer.alloc(16);
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0);
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(pngs[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    dir.push(e);
  }
  return Buffer.concat([header, ...dir, ...pngs]);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
