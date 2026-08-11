// Dev-only: downscale + re-encode source imagery to web-appropriate sizes.
// Run after dropping new files into public/services or public/founder.
import sharp from "sharp";
import { readdir, rename, unlink } from "fs/promises";
import path from "path";

const TARGETS = [
  { dir: "public/services", width: 760, quality: 78 },
  { dir: "public/founder", width: 900, quality: 80 },
];

for (const { dir, width, quality } of TARGETS) {
  const files = (await readdir(dir)).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
  for (const file of files) {
    const src = path.join(dir, file);
    const tmp = path.join(dir, `tmp-${file}`);
    await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toFile(tmp);
    await unlink(src);
    await rename(tmp, src);
    console.log(`optimized ${src}`);
  }
}
