import sharp from "sharp";
import { mkdirSync, readFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "C:/Users/erics/Pictures/Portfolio";
const OUT = "C:/Users/erics/Desktop/Ericsson Portfolio/public/gallery";
mkdirSync(OUT, { recursive: true });

const images = [
  ["SR-30.jpg", "frame-01.jpg"],
  ["SR-39.jpg", "frame-02.jpg"],
  ["SR-56.jpg", "frame-03.jpg"],
  ["SR-67.jpg", "frame-04.jpg"],
  ["ericsson-container-wall.jpg", "frame-05.jpg"],
  ["ericsson-garden-trio.jpg", "frame-06.jpg"],
  // Still HEIC; skipped until re-exported as JPEG:
  ["IMG_0667.jpeg", "frame-10.jpg"],
  ["IMG_7026_1.jpeg", "frame-11.jpg"],
  ["IMG_7036.jpeg", "frame-12.jpg"],
  ["IMG_7267.jpg", "frame-08.jpg"],
  ["Picsart_25-10-01_00-55-51-747_1.jpg", "frame-09.jpg"],
];

const report = [];
for (const [src, out] of images) {
  try {
    // HEIC masquerading as .jpeg: sniff the container before decoding.
    const head = readFileSync(join(SRC, src)).subarray(0, 16);
    const isJpeg = head[0] === 0xff && head[1] === 0xd8;
    const brand = head.subarray(8, 12).toString("latin1");
    if (!isJpeg && /hei|mif|msf|avif/.test(brand)) {
      report.push({ out, src, skipped: "HEIC/HEIF container, no decoder" });
      continue;
    }
    const img = sharp(join(SRC, src), { failOn: "none" }).rotate();
    const meta = await img.metadata();
    const landscape =
      (meta.autoOrient?.width ?? meta.width) >=
      (meta.autoOrient?.height ?? meta.height);
    const resized = await img
      .resize(
        landscape
          ? { width: 1600, withoutEnlargement: true }
          : { height: 1600, withoutEnlargement: true }
      )
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(join(OUT, out));
    report.push({
      out,
      w: resized.width,
      h: resized.height,
      kb: Math.round(resized.size / 1024),
    });
  } catch (err) {
    report.push({ out, src, skipped: String(err.message).slice(0, 80) });
  }
}

// Video codec sniff: scan the container for codec fourCCs.
const videos = [
  ["IMG_3044.MOV", "reel-01.mp4"],
  ["Snapchat-1242497174_2.mp4", "reel-02.mp4"],
  ["VID-20251001-WA0003_1.mp4", "reel-03.mp4"],
];
for (const [src, out] of videos) {
  const buf = readFileSync(join(SRC, src));
  const head = buf.toString("latin1");
  const codecs = ["avc1", "hvc1", "hev1", "vp09", "av01"].filter((c) =>
    head.includes(c)
  );
  // Track dimensions from the tkhd box: 16.16 fixed point at the box tail.
  let dims = null;
  const idx = buf.indexOf("tkhd");
  if (idx > 0) {
    const version = buf[idx + 4];
    const off = idx + 4 + (version === 1 ? 92 : 80);
    const w = buf.readUInt32BE(off) / 65536;
    const h = buf.readUInt32BE(off + 4) / 65536;
    if (w > 0 && h > 0) dims = { w, h };
  }
  const playable = codecs.includes("avc1");
  if (playable) copyFileSync(join(SRC, src), join(OUT, out));
  report.push({
    out,
    codecs,
    dims,
    playable,
    kb: Math.round(buf.length / 1024),
  });
}

console.log(JSON.stringify(report, null, 1));
