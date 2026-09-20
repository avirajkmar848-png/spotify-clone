/**
 * Scans the `songs/` directory and writes `songs.json` at the project root.
 *
 * The web player used to discover albums/songs by fetching a directory listing
 * and scraping the <a> tags out of it. Static hosts (Render, Netlify, Vercel,
 * S3, ...) do not expose directory listings, so that approach silently
 * returned nothing once deployed. Generating a manifest at build time keeps the
 * site a plain static site that works on any host.
 *
 * Usage:  node scripts/generate-manifest.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SONGS_DIR = path.join(ROOT, "songs");
const OUTPUT = path.join(ROOT, "songs.json");
const COVER_NAMES = ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"];

const AUDIO_EXTENSIONS = /\.(mp3|m4a|wav|ogg)$/i;

/** Turn a raw file name into something presentable as a track title. */
function cleanTitle(fileName) {
  let name = fileName.replace(AUDIO_EXTENSIONS, "");
  name = name.replace(/\([^)]*\.[a-z]{2,}[^)]*\)/gi, " "); // (KoshalWorld.Com)
  name = name.replace(/\b\d{2,3}\s*kbps\b/gi, " "); // 128 Kbps
  name = name.replace(/\s*-\s*copy\s*/gi, " "); // - Copy
  name = name.replace(/\s+/g, " ").trim();
  return name || fileName.replace(AUDIO_EXTENSIONS, "");
}

function readInfo(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "info.json"), "utf8"));
  } catch {
    return {};
  }
}

function buildManifest() {
  if (!fs.existsSync(SONGS_DIR)) {
    throw new Error(`No "songs" directory found at ${SONGS_DIR}`);
  }

  const albums = [];

  for (const entry of fs.readdirSync(SONGS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const folder = entry.name;
    const dir = path.join(SONGS_DIR, folder);

    const files = fs
      .readdirSync(dir)
      .filter((file) => AUDIO_EXTENSIONS.test(file))
      .sort((a, b) => a.localeCompare(b));

    // Skipping empty albums keeps every card on the page functional.
    if (files.length === 0) continue;

    const info = readInfo(dir);
    const cover = COVER_NAMES.find((name) => fs.existsSync(path.join(dir, name)));

    albums.push({
      folder,
      title: String(info.title || folder).trim(),
      description: String(info.description || "").trim(),
      cover: cover ? `songs/${folder}/${cover}` : null,
      songs: files.map((file) => ({
        title: cleanTitle(file),
        path: `songs/${folder}/${file}`,
      })),
    });
  }

  albums.sort((a, b) => a.title.localeCompare(b.title));

  return {
    generatedAt: new Date().toISOString(),
    albums,
  };
}

const manifest = buildManifest();
fs.writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const songCount = manifest.albums.reduce((total, album) => total + album.songs.length, 0);
console.log(
  `Wrote ${path.relative(ROOT, OUTPUT)} (${manifest.albums.length} albums, ${songCount} songs).`,
);
