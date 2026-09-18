# Applied Programming — Exam Prep

A phone-first revision app for FAU module 92402 (Applied Programming,
B.Sc. Artificial Intelligence). Two linked parts:

- **Reference Bank** — every exam-testable definition, formula, distinction
  and pitfall from the nine chapters of the course exam script, searchable,
  with a Cross-cutting view that threads the four ideas that recur across
  lectures.
- **Quiz** — multiple-choice and short-answer questions drawn from that same
  content, with scoring, a per-topic breakdown, retry-missed, and progress
  tracked across attempts.

Static files only. No backend, no build step, no framework, no runtime
dependencies. Works offline once loaded, and can be added to a phone's home
screen.

## Running it locally

Any static server works. To reproduce the GitHub Pages subpath exactly, serve
the *parent* directory:

```bash
python3 -m http.server 8765 --directory ..
```

Then open <http://localhost:8765/ap-exam-prep/>.

Serving the repo root instead would hide path bugs that only appear on Pages,
which is why the included `.claude/launch.json` uses `--directory ..`.

## Deploying to GitHub Pages

1. Create a repository named `ap-exam-prep` and push this branch to it.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the `main` branch and the `/ (root)` folder, then **Save**.
5. Wait for the first deployment, then open
   <https://anjannis.github.io/ap-exam-prep/>.

Every asset path in the app is relative, which is what makes the `/ap-exam-prep/`
subpath work. Adding a leading `/` to any path — a script, the manifest, the
service worker, a font — will break the deployment while still working locally
from a server root.

## Offline use

The app registers a cache-first service worker that precaches the shell, all
content and question data, and the vendored KaTeX fonts. After the first load
it works with no connection. To install it on a phone, open the Pages URL and
use the browser's "Add to Home Screen".

If you change content, regenerate the precache list and bump the cache version
so installed copies pick the change up:

```bash
node tools/build-precache.js
```

## Progress

Progress is stored in `localStorage`, so it is per-browser: your phone and your
laptop keep separate histories, and there is no sync. Use **Export progress** on
one device and **Import progress** on the other to carry it across. Import
merges rather than replacing, de-duplicating by attempt timestamp, so importing
the same file twice is harmless.

## Development

```bash
node --test                 # unit tests for the lib/ modules
node tools/validate.js      # data integrity across the content and question bank
node tools/report-bank.js   # quality report: duplicates, tag spread, coverage
```

`lib/*.js` modules are DOM-free and export via CommonJS as well as assigning a
global, which is what lets `node --test` load them directly with no build step.
Views under `views/*.js` own the DOM and are verified in a browser.

## Content sources

Authored from the course's own materials: primarily
`Applied_Programming_Exam_Script.pdf` (the 101-page study script compiled from
the seven lecture decks and the final-project README), with the individual
lecture decks used to recover slide-only material. Those PDFs are not
redistributed here — `tools/extract-script.py` extracts working text into a
gitignored `.source/` directory for authoring.
