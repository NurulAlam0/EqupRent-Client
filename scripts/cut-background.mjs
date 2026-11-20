/**
 * Cuts solid backgrounds out of the product images in public/image so they
 * sit directly on the banner's blue gradient, then saves trimmed PNGs.
 *
 * - White-background photos (laptop, drill, speaker): white flood-filled.
 * - Blue-background photo (drone): blue flood-filled.
 * - Only the largest remaining object is kept (drops stray fragments/shadows).
 * - logo.png is centre-cropped to a square mark for the navbar/watermark.
 *
 * Usage: npm run image:cut
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "image"
);

const isWhite = (r, g, b) =>
  Math.min(r, g, b) >= 195 && Math.max(r, g, b) - Math.min(r, g, b) <= 35;

const isBlue = (r, g, b) => b > r + 50 && b > 60;

/** Flood-fill background from the image borders, then keep only the largest object. */
async function cutout(input, output, isBg) {
  const { data, info } = await sharp(path.join(dir, input))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const total = width * height;
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  const matchesBg = (i) => isBg(...px(i));

  // 1. Mark background: flood from every border pixel that matches.
  const bg = new Uint8Array(total);
  const stack = new Int32Array(total);
  let sp = 0;
  const seed = (i) => {
    if (!bg[i] && matchesBg(i)) {
      bg[i] = 1;
      stack[sp++] = i;
    }
  };
  for (let x = 0; x < width; x++) {
    seed(x);
    seed((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    seed(y * width);
    seed(y * width + width - 1);
  }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % width;
    const y = (i / width) | 0;
    if (x > 0) seed(i - 1);
    if (x < width - 1) seed(i + 1);
    if (y > 0) seed(i - width);
    if (y < height - 1) seed(i + width);
  }

  // 2. Find connected opaque components; keep the largest (the product).
  const keep = new Uint8Array(total);
  const visited = new Uint8Array(total);
  let best = [];
  const compStack = new Int32Array(total);
  for (let start = 0; start < total; start++) {
    if (bg[start] || visited[start]) continue;
    const component = [];
    let csp = 0;
    visited[start] = 1;
    compStack[csp++] = start;
    while (csp > 0) {
      const i = compStack[--csp];
      component.push(i);
      const x = i % width;
      const y = (i / width) | 0;
      const visit = (n) => {
        if (!bg[n] && !visited[n]) {
          visited[n] = 1;
          compStack[csp++] = n;
        }
      };
      if (x > 0) visit(i - 1);
      if (x < width - 1) visit(i + 1);
      if (y > 0) visit(i - width);
      if (y < height - 1) visit(i + width);
    }
    if (component.length > best.length) best = component;
  }

  // 3. Apply alpha: background + everything except the largest object.
  for (const i of best) keep[i] = 1;
  for (let i = 0; i < total; i++) {
    if (!keep[i]) data[i * 4 + 3] = 0;
  }

  // 4. Trim to the product's bounding box (2px pad) and export.
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (const i of best) {
    const x = i % width;
    const y = (i / width) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const left = Math.max(0, minX - 2);
  const top = Math.max(0, minY - 2);
  const cropW = Math.min(width - left, maxX + 3 - left);
  const cropH = Math.min(height - top, maxY + 3 - top);

  const out = await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: cropW, height: cropH })
    .resize({ width: 900, withoutEnlargement: true })
    .png()
    .toBuffer();

  await sharp(out).toFile(path.join(dir, output));
  const coverage = ((best.length / total) * 100).toFixed(1);
  console.log(
    `${input} -> ${output}  ${cropW}x${cropH}  (kept ${coverage}% of pixels)`
  );
}

// Crop the logo to a centred square (keeps its blue glow, matches the banner).
async function cropLogo() {
  const src = path.join(dir, "logo.png");
  const meta = await sharp(src).metadata();
  const size = Math.min(meta.width, meta.height);
  await sharp(src)
    .extract({
      left: Math.round((meta.width - size) / 2),
      top: Math.round((meta.height - size) / 2),
      width: size,
      height: size,
    })
    .png()
    .toFile(path.join(dir, "logo-mark.png"));
  console.log(`logo.png -> logo-mark.png  ${size}x${size}`);
}

await cutout("pawar dreller.png", "drill.png", isWhite);
await cutout("leptop.jpeg", "laptop.png", isWhite);
await cutout("speker.png", "speaker.png", isWhite);
await cutout("dron.png", "drone.png", isBlue);
await cropLogo();
console.log("done");
