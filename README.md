# Spotify Clone

A Spotify-style web music player built with plain HTML, CSS and JavaScript. No
framework, no backend — it deploys as a static site.

## Features

- **Live search** of the iTunes catalogue (no API key, no backend) playing
  30-second Apple Music previews
- Album grid driven by `songs.json` for your own local tracks
- Click an album to load its track list, click a track to play it
- Play / pause, previous, next, auto-advance to the next track
- Seekable progress bar with elapsed / total time
- Volume slider with a mute toggle
- Responsive layout with a slide-out sidebar on small screens
- Space bar toggles play / pause

## Two music sources

**Live search** hits the [iTunes Search API](https://performance-partners.apple.com/search-api),
which sends `Access-Control-Allow-Origin: *` and requires no key — so it works
straight from a static page. Results are normalised into the same queue shape as
the local tracks, so play/pause, next, previous, seeking and auto-advance all
behave the same. Note these are 30-second previews, not full songs; full-track
playback would need Apple Music/Spotify user auth and a server to hold secrets.

Searches are deep-linkable: [`/?q=coldplay`](/?q=coldplay) runs a search on load.

**Your library** is whatever is committed under `songs/` and listed in
`songs.json` — see below.

## Project structure

```
index.html                      Markup for the sidebar, search, album grid and player bar
style.css                       Layout and component styles
utility.css                     Small utility + scrollbar styles
script.js                       Player logic (manifest, live search, playback, controls)
songs.json                      Generated album/track manifest — loaded at runtime
scripts/generate-manifest.js    Scans songs/ and regenerates songs.json
render.yaml                     Render Blueprint (static site)
Images/                         Icons (play, pause, volume, ...)
songs/<album>/                  Album folders: info.json, cover.jpg and .mp3 files
```

### How the music library is discovered

`script.js` reads `songs.json` at runtime. It deliberately does **not** fetch
directory listings — static hosts (Render, Netlify, Vercel, GitHub Pages, S3)
do not expose them, which is why a directory-scraping player appears empty once
deployed.

## Adding an album or song

1. Create the folder and add your files:

   ```
   songs/My Album/info.json          { "title": "My Album", "description": "Chill vibes" }
   songs/My Album/cover.jpg          Album artwork
   songs/My Album/Some Track.mp3     One or more audio files
   ```

2. Regenerate the manifest:

   ```bash
   node scripts/generate-manifest.js
   ```

3. Commit and push. If you deploy with the included Blueprint, Render also runs
   this step automatically on every deploy.

Folders that contain no audio files are skipped, so an album always has at least
one playable track.

## Run it locally

Any static file server works. For example:

```bash
npx serve .
# or
python -m http.server 8080
```

Then open <http://localhost:3000> (or whichever port the server prints). The
page must be served over HTTP — opening `index.html` via `file://` blocks the
`songs.json` fetch.

Search needs outbound network access to `itunes.apple.com`; the library and
player work fully offline.

## Deploy to Render

### Option A — Blueprint (uses `render.yaml`)

1. Push this repository to GitHub (already at
   `github.com/avirajkmar848-png/spotify-clone`).
2. In the Render Dashboard go to **New → Blueprint**.
3. Select the repository. Render reads `render.yaml` and creates the
   `spotify-clone` static site automatically.
4. Apply the Blueprint. Every push to `master` redeploys.

### Option B — Manual static site

1. In the Render Dashboard go to **New → Static Site** and pick the repository.
2. Configure:
   - **Branch:** `master`
   - **Build Command:** `node scripts/generate-manifest.js`
   - **Publish Directory:** `.`
3. Click **Create Static Site**.

Render serves the site at `https://<service-name>.onrender.com`.

## Note on the sample tracks

The `.mp3` files currently committed are third-party copyrighted songs included
as placeholders. Replace them with your own audio (or royalty-free music) before
sharing the site publicly.
