import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { statSync, readFileSync } from "node:fs";

const SRC = "C:/Users/erics/Pictures/Portfolio/IMG_3044.MOV";
const OUT = "C:/Users/erics/Desktop/Ericsson Portfolio/public/gallery/reel-01.mp4";

try {
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i", SRC,
      "-an",
      "-vf", "scale='trunc(min(1080,iw)/2)*2':'-2'",
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "25",
      "-movflags", "+faststart",
      OUT,
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );
} catch (err) {
  console.error("ffmpeg failed:\n" + String(err.stderr).slice(-1500));
  process.exit(1);
}

const buf = readFileSync(OUT);
const head = buf.toString("latin1");
// Confirm output resolution from the tkhd box.
const idx = buf.indexOf("tkhd");
let dims = null;
if (idx > 0) {
  const version = buf[idx + 4];
  const off = idx + 4 + (version === 1 ? 92 : 80);
  dims = { w: buf.readUInt32BE(off) / 65536, h: buf.readUInt32BE(off + 4) / 65536 };
}
console.log(
  JSON.stringify({
    kb: Math.round(statSync(OUT).size / 1024),
    codecs: ["avc1", "hvc1"].filter((c) => head.includes(c)),
    dims,
  })
);
