# Spotify Clone

A Spotify-style web music player built with vanilla HTML, CSS, and JavaScript — no frameworks, no backend, no build step.

> **Live demo:** [spotify-clone-y9es.onrender.com](https://spotify-clone-y9es.onrender.com/)

## Features

- **Live search** of the iTunes catalogue — no API key or backend required, playing 30-second Apple Music previews
- Album grid driven by `songs.json` for your own local tracks
- Click an album to load its track list, click a track to play it
- Play / pause, previous / next, and auto-advance to the next track
- Seekable progress bar with elapsed / total time
- Volume slider with a mute toggle
- Responsive layout with a slide-out sidebar on small screens
- Space bar toggles play / pause
- Deep-linkable searches: `/?q=coldplay` runs a search on load

## Two music sources

**Live search** hits the [iTunes Search API](https://performance-partners.apple.com/search-api), which sends `Access-Control-Allow-Origin: *` and requires no key — so it works straight from a static page. Results are normalised into the same queue shape as the local tracks, so play/pause, next, previous, seeking, and auto-advance all behave identically.

> Note: these are 30-second previews, not full songs. Full-track playback would require Apple Music/Spotify user auth and a server to hold secrets.

**Your library** is whatever is committed under `songs/` and listed in `songs.json`.

## Project structure

```
index.html                      Markup for the sidebar, search, album grid, and player bar
style.css                       Layout and component styles
utility.css                     Small utility + scrollbar styles
script.js                       Player logic (manifest, live search, playback, controls)
songs.json                      Generated album/track manifest — loaded at runtime
scripts/generate-manifest.js    Scans songs/ and regenerates songs.json
render.yaml                     Render static-site blueprint
Images/                         Icons (play, pause, volume, ...)
songs/<album>/                  Album folders: info.json, cover.jpg, and audio files
```

### How the music library is discovered

`script.js` reads `songs.json` at runtime. It deliberately does **not** fetch directory listings — static hosts (Render, Netlify, Vercel, GitHub Pages, S3) do not expose them, so a directory-scraping player would appear empty once deployed.

## Adding an album or song

1. Create a folder and add your files:

   ```
   songs/My Album/info.json          { "title": "My Album", "description": "Chill vibes" }
   songs/My Album/cover.jpg          Album artwork
   songs/My Album/Some Track.mp3     One or more audio files
   ```

2. Regenerate the manifest:

   ```bash
   node scripts/generate-manifest.js
   ```

3. Commit and push. The manifest is regenerated automatically on every deploy.

Folders that contain no audio files are skipped, so an album always has at least one playable track.

## Run it locally

Any static file server works. For example:

```bash
npx serve .
# or
python -m http.server 8080
```

Then open <http://localhost:3000> (or whichever port the server prints). The page must be served over HTTP — opening `index.html` via `file://` blocks the `songs.json` fetch.

Search needs outbound network access to `itunes.apple.com`; the library and player work fully offline.

## Note on the sample tracks

The `.mp3` files in the repository are third-party copyrighted songs included as placeholders. Replace them with your own audio (or royalty-free music) before sharing the site publicly.