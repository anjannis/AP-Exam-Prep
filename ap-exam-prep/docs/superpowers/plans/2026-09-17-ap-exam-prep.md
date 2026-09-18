# Applied Programming Exam Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, offline-capable, phone-first browser app for revising FAU module 92402 (Applied Programming), combining a Reference Bank of exam-testable content with a self-testing quiz and progress tracking.

**Architecture:** Plain HTML/CSS/JS with no framework and no build step. Logic units (`lib/*.js`) are DOM-free IIFEs that assign a global and also export via CommonJS, so `node --test` can unit-test them directly while the browser loads them as ordinary `<script>` tags. View units (`views/*.js`) own the DOM and are verified in a browser. Content and questions are plain JS files that push onto globals declared in `content.js` / `questions.js`, split one file per chapter. KaTeX is vendored. Everything is served from the repo root with relative paths so GitHub Pages can host it at a repo subpath.

**Tech Stack:** HTML5, CSS custom properties, ES5-compatible browser JS (no transpiler), KaTeX 0.16.22 (vendored), `node:test` + `node:assert` for unit tests (Node 26, zero dependencies), Python 3 `http.server` for local subpath serving, service worker + web app manifest for offline.

**Spec:** `docs/superpowers/specs/2026-09-17-ap-exam-prep-design.md`

## Global Constraints

- **No build step.** No bundler, transpiler, or package manager in the served output. No `package.json` `"type"` field, so Node treats `.js` as CommonJS and `require()` works in tests.
- **Run the whole suite as bare `node --test`** (auto-discovers from the working directory), or name a file explicitly: `node --test tests/foo.test.js`. Two forms are verified broken on this Node build (v26.7.0) and must never be used: `node --test tests/` treats the directory as an entry module and dies with `Cannot find module '…/tests'` while still printing `fail 1`, so it looks like a test failure rather than a bad invocation; and `node --test=tests/` prints `pass 1, fail 0` and **exits 0 even when the suite would fail**, which is a silent false pass.
- **No runtime dependencies.** Nothing fetched from a CDN at runtime. KaTeX vendored under `vendor/katex/`.
- **No `fetch` for app data.** Content and questions load via `<script>` tags, so the app also works from `file://`.
- **Every path relative, no leading `/`.** Applies to scripts, stylesheet, manifest, icons, service worker registration, and the service worker's precache list. A leading `/` breaks GitHub Pages project sites, which serve from `/<repo>/`.
- **Target URL:** `https://anjannis.github.io/ap-exam-prep/`. All local verification serves the app at a subpath (`http://localhost:8765/ap-exam-prep/`), never at server root.
- **Item id scheme:** `l<chapter>-<kebab-slug>`, chapter-scoped and unique across the whole bank.
- **Question id scheme:** `l<chapter>-<zero-padded-3-digit-sequence>`, e.g. `l2-014`.
- **Cross-cutting group keys (exactly these four):** `bias-variance`, `convolution`, `information-loss`, `separation-of-concerns`.
- **Item types (exactly these five):** `definition`, `formula`, `distinction`, `fact`, `pitfall`.
- **Question modes (exactly these two):** `mc`, `short`.
- **Per-chapter content targets:** 25–40 items, 15–20 questions, 55–65% of questions in `mc` mode.
- **`localStorage` key:** `ap-exam-prep/progress/v1`.
- **Source material offset:** in `Applied_Programming_Exam_Script.pdf`, PDF page = printed script page + 3. Verified.
- **Chapter ranges (PDF pages, inclusive):** Ch1 6–13, Ch2 14–25, Ch3 26–35, Ch4 36–43, Ch5 44–49, Ch6 50–57, Ch7 58–67, Ch8 68–85, Ch9 86–93, Appendix A (cheat sheet) 94–97, Appendix B (glossary) 98–101.
- **Language:** English throughout, matching the lectures and script.

---

## File Structure

| Path | Responsibility |
|---|---|
| `index.html` | Document shell; loads every script in dependency order; registers the service worker |
| `style.css` | All styling; colour tokens on `:root`; mobile-first with desktop media queries |
| `app.js` | Boot, router wiring, view mounting, nav state. No business logic |
| `lib/router.js` | Parse and format hash routes. No DOM |
| `lib/content-index.js` | Flatten `LECTURES`, index items by id, gather items by cross-cutting key. No DOM |
| `lib/search.js` | Build a search index over flattened items and query it. No DOM |
| `lib/quiz-engine.js` | Build a question set from scope + mode, track answers, summarise. No DOM |
| `lib/progress-store.js` | `localStorage` persistence, attempt records, topic accuracy, export/import. No DOM; storage injected |
| `views/reference-view.js` | Lecture nav, sections, item cards, search UI, cross-cutting tab |
| `views/quiz-view.js` | Scope/mode picker, question flow, summary, retry-missed |
| `views/progress-view.js` | Attempt trend, per-topic accuracy, reset, export/import UI |
| `content.js` | Declares `LECTURES = []` and `CROSS_CUTTING` group definitions |
| `content/l1.js` … `content/l9.js` | One chapter each; pushes onto `LECTURES` |
| `questions.js` | Declares `QUESTIONS = []` |
| `questions/l1.js` … `questions/l9.js` | One chapter each; pushes onto `QUESTIONS` |
| `vendor/katex/` | `katex.min.css`, `katex.min.js`, `fonts/*.woff2` |
| `manifest.json` | PWA manifest; relative `start_url` |
| `sw.js` | Cache-first service worker; versioned precache of shell, data, and KaTeX |
| `icons/` | `icon-192.png`, `icon-512.png` |
| `tests/*.test.js` | `node:test` unit tests for each `lib/` module |
| `tests/fixtures/fixture-chapter.js` | A valid minimal chapter, used by the validator's own tests |
| `tools/validate.js` | Data integrity checks over the assembled content and question bank |
| `tools/load-bank.js` | Evaluates the plain browser data scripts in a Node sandbox |
| `tools/build-precache.js` | Regenerates the service worker's precache list and bumps its cache version |
| `tools/report-bank.js` | Quality report: duplicate terms, topic tag spread, cross-cutting coverage |
| `tools/extract-script.py` | One-off text extraction from the exam script PDF into `.source/` |
| `tools/make-icons.py` | One-off PWA icon generation, standard library only |
| `.claude/launch.json` | Dev server config serving the parent dir, so the app sits at a subpath |
| `.gitignore` | Excludes `.source/` (extracted course material) and `.DS_Store` |
| `README.md` | What it is, how to run locally, how to enable GitHub Pages |

`.source/` holds text extracted from the course PDFs for authoring. It is gitignored: the extracted text is course material and does not belong in a public repo.

**Script order in `index.html`** — load order matters because later files depend on globals from earlier ones:

1. `vendor/katex/katex.min.js`
2. `content.js`, then `content/l1.js` … `content/l9.js`
3. `questions.js`, then `questions/l1.js` … `questions/l9.js`
4. `lib/router.js`, `lib/content-index.js`, `lib/search.js`, `lib/quiz-engine.js`, `lib/progress-store.js`
5. `app.js`
6. `views/reference-view.js`, `views/quiz-view.js`, `views/progress-view.js`

`app.js` precedes the views because each view calls `App.register(...)` at evaluation time, so `App` must already exist. `app.js` does its own work on `DOMContentLoaded`, which fires after every script has run, so the registry is complete by the time the first render happens.

---

## Task Overview

| # | Task | Deliverable |
|---|---|---|
| 1 | Scaffold, vendored KaTeX, app shell | App loads at a subpath with no 404s; KaTeX renders a formula |
| 2 | Data contract and validator | `tools/validate.js` passes against a fixture chapter |
| 3 | Exemplar chapter (L2) | Real content + questions for Lecture 2; validator passes |
| 4 | `lib/content-index.js` | Flatten/index/cross-ref helpers, unit tested |
| 5 | `lib/search.js` | Search over items, unit tested |
| 6 | `lib/quiz-engine.js` | Set building, scoring, summary, unit tested |
| 7 | `lib/progress-store.js` | Persistence, topic accuracy, export/import merge, unit tested |
| 8 | `lib/router.js` + `app.js` boot | Three views switchable by hash, deep links work |
| 9 | `views/reference-view.js` | Browsable bank with search, cross-cutting tab, KaTeX formulas |
| 10 | `views/quiz-view.js` | Full quiz flow end to end including retry-missed |
| 11 | `views/progress-view.js` | Trend, topic accuracy, reset, export/import |
| 12 | Responsive and dark mode | Verified at 375px portrait and desktop, both colour schemes |
| 13 | PWA manifest and service worker | App loads with the network disabled |
| 14 | Author remaining 8 chapters | L1, L3–L9 content + questions against the contract |
| 15 | Reconciliation pass | Dedup, terminology, crossRef wiring, difficulty calibration |
| 16 | README and final verification | Pages instructions; full end-to-end check |

Tasks 4–7 are independent of each other and of 9–11. Task 14 dispatches parallel authors against the Task 3 exemplar.

---

### Task 1: Scaffold, vendored KaTeX, app shell

**Files:**
- Create: `.gitignore`, `index.html`, `style.css`, `app.js`, `.claude/launch.json`, `tools/extract-script.py`
- Create: `vendor/katex/katex.min.css`, `vendor/katex/katex.min.js`, `vendor/katex/fonts/*.woff2`

**Interfaces:**
- Consumes: nothing
- Produces: a served app shell at `http://localhost:8765/ap-exam-prep/`; global `katex` with `katex.renderToString(latex, opts)`; `.source/script.txt` containing the exam script text with `=== PAGE n ===` markers

- [ ] **Step 1: Write `.gitignore`**

```
.source/
.DS_Store
node_modules/
```

- [ ] **Step 2: Vendor KaTeX**

Run from the repo root:

```bash
mkdir -p vendor/katex/fonts && cd /tmp && curl -sL -o katex.tgz "https://registry.npmjs.org/katex/-/katex-0.16.22.tgz" && tar xzf katex.tgz && cd - && cp /tmp/package/dist/katex.min.css /tmp/package/dist/katex.min.js vendor/katex/ && cp /tmp/package/dist/fonts/*.woff2 vendor/katex/fonts/ && ls vendor/katex vendor/katex/fonts | head -30
```

Expected: `katex.min.css`, `katex.min.js`, and 20 `.woff2` files.

Only `.woff2` is copied. `katex.min.css` lists `woff2`, `woff` and `ttf` sources per `@font-face`; every browser that matters picks `woff2` first, so the other two are dead weight. This is why the service worker precache list in Task 13 must list only `.woff2`.

- [ ] **Step 3: Verify the vendored CSS uses relative font paths**

```bash
grep -o "url([^)]*KaTeX_Main-Regular[^)]*)" vendor/katex/katex.min.css | head
```

Expected: paths beginning `fonts/`, not `/fonts/`. If any path is absolute, the subpath deployment will 404 on fonts — rewrite them with `sed -i '' 's|url(/fonts/|url(fonts/|g' vendor/katex/katex.min.css` and re-check.

- [ ] **Step 4: Write `tools/extract-script.py`**

```python
#!/usr/bin/env python3
"""Extract the exam script PDF to text with page markers, into .source/.

Requires pypdf. The output is gitignored course material.
"""
import pathlib
import sys

import pypdf

DEFAULT_PDF = (
    "../Applied-Programming-2026/applied_programming_project/"
    "Lecture slides/Applied_Programming_Exam_Script.pdf"
)


def main():
    pdf_path = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF)
    if not pdf_path.exists():
        sys.exit(f"not found: {pdf_path}")

    out_dir = pathlib.Path(".source")
    out_dir.mkdir(exist_ok=True)

    reader = pypdf.PdfReader(str(pdf_path))
    chunks = []
    for index, page in enumerate(reader.pages, start=1):
        chunks.append(f"=== PAGE {index} ===")
        chunks.append(page.extract_text() or "")

    out_path = out_dir / "script.txt"
    out_path.write_text("\n".join(chunks), encoding="utf-8")
    print(f"{out_path}: {len(reader.pages)} pages, {out_path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Run the extraction**

```bash
python3 tools/extract-script.py
```

Expected: `.source/script.txt: 101 pages, ~194000 bytes`. If `pypdf` is missing, install it into whatever environment is handy (`pip install pypdf` or `uv pip install pypdf`) — it is an authoring-time tool only and never ships.

- [ ] **Step 6: Write `index.html`**

Only the shell for now; the data and view scripts are commented out and uncommented by the tasks that create them. Every path is relative.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1f6feb">
<title>AP Exam Prep</title>
<link rel="stylesheet" href="vendor/katex/katex.min.css">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="topbar">
  <h1 class="topbar-title">AP Exam Prep</h1>
  <p class="topbar-sub">FAU 92402 &middot; Applied Programming</p>
</header>

<main id="main" class="main"></main>

<nav class="tabbar" aria-label="Main">
  <a class="tab" data-view="reference" href="#/reference">Reference</a>
  <a class="tab" data-view="quiz" href="#/quiz">Quiz</a>
  <a class="tab" data-view="progress" href="#/progress">Progress</a>
</nav>

<script src="vendor/katex/katex.min.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 7: Write a minimal `style.css`**

Colour tokens and layout skeleton only; Task 12 does the full responsive and dark-mode pass.

```css
:root {
  --bg: #ffffff;
  --surface: #f6f8fa;
  --border: #d0d7de;
  --text: #1f2328;
  --text-dim: #656d76;
  --accent: #1f6feb;
  --ok: #1a7f37;
  --bad: #cf222e;
  --warn: #9a6700;
  --tabbar-h: 3.5rem;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0d1117;
    --surface: #161b22;
    --border: #30363d;
    --text: #e6edf3;
    --text-dim: #8b949e;
    --accent: #4493f8;
    --ok: #3fb950;
    --bad: #f85149;
    --warn: #d29922;
  }
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 1rem/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
}

.topbar { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); }
.topbar-title { margin: 0; font-size: 1.05rem; }
.topbar-sub { margin: 0.15rem 0 0; font-size: 0.8rem; color: var(--text-dim); }

.main { padding: 1rem; }

.tabbar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  display: flex;
  height: var(--tabbar-h);
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.85rem;
}

.tab[aria-current="page"] { color: var(--accent); font-weight: 600; }
```

- [ ] **Step 8: Write a minimal `app.js`**

Proves the shell boots and KaTeX renders. Replaced by real routing in Task 8.

```js
(function () {
  'use strict';

  function boot() {
    var main = document.getElementById('main');
    var probe = document.createElement('p');
    try {
      probe.innerHTML = 'KaTeX check: ' + katex.renderToString('f_s > 2 f_{max}', {
        throwOnError: false
      });
    } catch (err) {
      probe.textContent = 'KaTeX failed: ' + err.message;
    }
    main.appendChild(probe);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
```

- [ ] **Step 9: Write `.claude/launch.json`**

`--directory ..` serves the parent folder, so the app sits at `/ap-exam-prep/` and reproduces the GitHub Pages subpath exactly. Serving from the repo root would hide every absolute-path bug this is meant to catch.

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "ap-exam-prep",
      "runtimeExecutable": "python3",
      "runtimeArgs": ["-m", "http.server", "8765", "--directory", ".."],
      "port": 8765
    }
  ]
}
```

- [ ] **Step 10: Start the server and load the app at its subpath**

Start the `ap-exam-prep` dev server, then navigate to `http://localhost:8765/ap-exam-prep/`.

Expected: the header, an empty main area with the rendered formula *f<sub>s</sub> > 2f<sub>max</sub>* in KaTeX's serif math styling (not raw LaTeX, not a fallback sans-serif), and the three-tab bar pinned to the bottom.

- [ ] **Step 11: Confirm no asset 404s**

Read the console messages and the network requests for the loaded page.

Expected: zero console errors; `katex.min.css`, `katex.min.js`, `style.css`, `app.js` and at least one `KaTeX_Main-Regular.woff2` all return 200. A 404 on a font means Step 3 did not fix the CSS paths.

- [ ] **Step 12: Commit**

```bash
git add .gitignore index.html style.css app.js .claude/launch.json tools/extract-script.py vendor/
git commit -m "feat: app shell with vendored KaTeX, served at a repo subpath"
```

---

### Task 2: Data contract and validator

**Files:**
- Create: `content.js`, `questions.js`, `tools/validate.js`, `tools/load-bank.js`
- Create: `tests/fixtures/fixture-chapter.js`, `tests/validate.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces:
  - global `LECTURES` (array) and `CROSS_CUTTING` (array of `{key, title, blurb}`) from `content.js`
  - global `QUESTIONS` (array) from `questions.js`
  - `checkAll(lectures, questions, groups, {countsEnforced})` → array of problem strings, exported from `tools/validate.js`
  - `loadBank()` → `{lectures, questions, groups, files}`, exported from `tools/load-bank.js`
  - a CLI: `node tools/validate.js` exits 0 on success, or 1 printing each problem

The file is `validate.js`, not `validate.mjs`, because the test `require`s it: with no `"type"` field in the repo there is no `package.json` at all, so Node treats `.js` as CommonJS, while a `.mjs` extension would force ESM and break `require`.

- [ ] **Step 1: Write `content.js`**

The four groups are copied from §9.2 of the script rather than invented, because that section states which cross-lecture threads the exam is likely to test.

```js
// Declares the content globals. Chapter files in content/ push onto LECTURES.
var LECTURES = [];

// Cross-cutting threads, taken from script §9.2 "Four ideas that recur in
// every lecture". An item's crossRef entries must name keys from this list.
var CROSS_CUTTING = [
  {
    key: 'bias-variance',
    title: 'The bias–variance trade-off in four costumes',
    blurb: 'You can have detail or you can have stability; the parameter you tune decides which. It appears as the moving-average window length (L2), the Welch segment length (L2), the convolution kernel length (L3) and the level of detail in a simulation (L5). If a result looks wrong, work out which side of this trade-off you are on before changing anything else.'
  },
  {
    key: 'convolution',
    title: 'Convolution is everywhere',
    blurb: 'Filtering, smoothing, signal generation and feature extraction are one operation with different kernels. The moving-average envelope (L2), the window functions (L3), the EMG generation model of spike train convolved with MUAP shape (L4), the RC filter implemented in copper (L7) and the firing-rate decoder are all y = x * h.'
  },
  {
    key: 'information-loss',
    title: 'Information is destroyed at three identifiable places',
    blurb: 'Three points in the chain lose information irreversibly, and only three: aliasing at the sampler, prevented only by an analog filter before conversion; quantisation at the converter, mitigated only by gain in front of it or more bits; and overlap in frequency at the filter, which no filter of any order can undo. Everything else is recoverable.'
  },
  {
    key: 'separation-of-concerns',
    title: 'Separation of concerns, in hardware and software',
    blurb: 'The amplifier, anti-aliasing filter, sample-and-hold and converter each do one thing and hand off cleanly, and you never read the data line before the status line permits it (L6). The socket, buffer, state and widgets each do one thing, and the View never reads data before the ViewModel emits it (L8). Same discipline; in both cases the interface is a contract and the handshake makes it explicit.'
  }
];

if (typeof module !== 'undefined') {
  module.exports = { LECTURES: LECTURES, CROSS_CUTTING: CROSS_CUTTING };
}
```

- [ ] **Step 2: Write `questions.js`**

```js
// Declares the question global. Chapter files in questions/ push onto QUESTIONS.
var QUESTIONS = [];

if (typeof module !== 'undefined') {
  module.exports = { QUESTIONS: QUESTIONS };
}
```

- [ ] **Step 3: Write the fixture chapter**

A deliberately *valid* two-item chapter, used to prove the validator passes clean data before the real chapters exist. Tests mutate copies of it to prove each rule fires.

```js
// tests/fixtures/fixture-chapter.js
// A minimal valid chapter, used only by the validator's self-test.
var FIXTURE_LECTURE = {
  id: 99,
  name: 'Fixture Chapter',
  shortName: 'Fixture',
  sections: [
    {
      heading: 'Fixture section',
      items: [
        {
          id: 'l99-alpha',
          type: 'definition',
          term: 'Alpha',
          body: 'The first fixture item.',
          formula: null,
          symbols: null,
          crossRef: []
        },
        {
          id: 'l99-beta',
          type: 'formula',
          term: 'Beta',
          body: 'The second fixture item, which carries a formula.',
          formula: 'f_s > 2 f_{max}',
          symbols: 'f_s is the sampling rate; f_max is the highest frequency present in the signal.',
          crossRef: ['information-loss']
        }
      ]
    }
  ]
};

var FIXTURE_QUESTIONS = [
  {
    id: 'l99-001',
    lecture: 99,
    topic: 'fixture',
    mode: 'mc',
    question: 'Which fixture item carries a formula?',
    options: ['Alpha', 'Beta', 'Neither', 'Both'],
    correctIndex: 1,
    answer: 'Beta carries the formula.',
    contentRef: 'l99-beta'
  },
  {
    id: 'l99-002',
    lecture: 99,
    topic: 'fixture',
    mode: 'short',
    question: 'State what the fixture proves.',
    answer: 'That the validator accepts well-formed data.',
    contentRef: 'l99-alpha'
  }
];

if (typeof module !== 'undefined') {
  module.exports = {
    FIXTURE_LECTURE: FIXTURE_LECTURE,
    FIXTURE_QUESTIONS: FIXTURE_QUESTIONS
  };
}
```

- [ ] **Step 4: Write the failing validator test**

```js
// tests/validate.test.js
const test = require('node:test');
const assert = require('node:assert');
const { checkAll } = require('../tools/validate.js');
const { FIXTURE_LECTURE, FIXTURE_QUESTIONS } = require('./fixtures/fixture-chapter.js');

const GROUPS = [
  { key: 'bias-variance' },
  { key: 'convolution' },
  { key: 'information-loss' },
  { key: 'separation-of-concerns' }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function run(mutate) {
  const lectures = [clone(FIXTURE_LECTURE)];
  const questions = clone(FIXTURE_QUESTIONS);
  if (mutate) mutate(lectures, questions);
  // countsEnforced: false so a 2-item fixture is not judged against the
  // 25-40 item production target.
  return checkAll(lectures, questions, GROUPS, { countsEnforced: false });
}

test('clean fixture data produces no problems', () => {
  assert.deepStrictEqual(run(), []);
});

test('duplicate item ids are reported', () => {
  const problems = run((lectures) => {
    lectures[0].sections[0].items[1].id = 'l99-alpha';
  });
  assert.match(problems.join('\n'), /duplicate item id.*l99-alpha/i);
});

test('an unknown item type is reported', () => {
  const problems = run((lectures) => {
    lectures[0].sections[0].items[0].type = 'anecdote';
  });
  assert.match(problems.join('\n'), /unknown type.*anecdote/i);
});

test('a formula item without symbols is reported', () => {
  const problems = run((lectures) => {
    lectures[0].sections[0].items[1].symbols = null;
  });
  assert.match(problems.join('\n'), /l99-beta.*symbols/i);
});

test('an undeclared crossRef key is reported', () => {
  const problems = run((lectures) => {
    lectures[0].sections[0].items[0].crossRef = ['vibes'];
  });
  assert.match(problems.join('\n'), /unknown crossRef.*vibes/i);
});

test('a dangling contentRef is reported', () => {
  const problems = run((lectures, questions) => {
    questions[0].contentRef = 'l99-missing';
  });
  assert.match(problems.join('\n'), /contentRef.*l99-missing/i);
});

test('an mc question without exactly four options is reported', () => {
  const problems = run((lectures, questions) => {
    questions[0].options = ['only', 'three', 'here'];
  });
  assert.match(problems.join('\n'), /l99-001.*4 options/i);
});

test('an out-of-range correctIndex is reported', () => {
  const problems = run((lectures, questions) => {
    questions[0].correctIndex = 4;
  });
  assert.match(problems.join('\n'), /l99-001.*correctIndex/i);
});

test('duplicate mc options are reported', () => {
  const problems = run((lectures, questions) => {
    questions[0].options[2] = 'Beta';
  });
  assert.match(problems.join('\n'), /l99-001.*duplicate option/i);
});

test('an empty answer is reported', () => {
  const problems = run((lectures, questions) => {
    questions[1].answer = '   ';
  });
  assert.match(problems.join('\n'), /l99-002.*answer/i);
});

test('a short question carrying mc fields is reported', () => {
  const problems = run((lectures, questions) => {
    questions[1].options = ['a', 'b', 'c', 'd'];
  });
  assert.match(problems.join('\n'), /l99-002.*short/i);
});

test('question counts are enforced when countsEnforced is true', () => {
  const lectures = [clone(FIXTURE_LECTURE)];
  const questions = clone(FIXTURE_QUESTIONS);
  const problems = checkAll(lectures, questions, GROUPS, { countsEnforced: true });
  assert.match(problems.join('\n'), /chapter 99/i);
});
```

- [ ] **Step 5: Run the test to verify it fails**

```bash
node --test
```

Expected: FAIL, `Cannot find module '../tools/validate.js'`.

- [ ] **Step 6: Write `tools/validate.js`**

```js
// tools/validate.js
// Data integrity checks over the assembled content and question bank.
// Run: node tools/validate.js
'use strict';

const ITEM_TYPES = ['definition', 'formula', 'distinction', 'fact', 'pitfall'];
const MODES = ['mc', 'short'];
const MIN_ITEMS = 25;
const MAX_ITEMS = 40;
const MIN_QUESTIONS = 15;
const MAX_QUESTIONS = 20;
const MIN_MC_RATIO = 0.55;
const MAX_MC_RATIO = 0.65;

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function checkItems(lectures, groupKeys, problems) {
  const seen = new Map();

  lectures.forEach((lecture) => {
    if (!Number.isInteger(lecture.id)) {
      problems.push(`lecture "${lecture.name}": id must be an integer`);
    }
    if (isBlank(lecture.name)) problems.push(`lecture ${lecture.id}: name is empty`);
    if (isBlank(lecture.shortName)) problems.push(`lecture ${lecture.id}: shortName is empty`);
    if (!Array.isArray(lecture.sections) || lecture.sections.length === 0) {
      problems.push(`lecture ${lecture.id}: no sections`);
      return;
    }

    lecture.sections.forEach((section) => {
      if (isBlank(section.heading)) {
        problems.push(`lecture ${lecture.id}: a section has an empty heading`);
      }
      if (!Array.isArray(section.items) || section.items.length === 0) {
        problems.push(`lecture ${lecture.id} / "${section.heading}": no items`);
        return;
      }

      section.items.forEach((item) => {
        const where = `item ${item.id || '(missing id)'}`;

        if (isBlank(item.id)) {
          problems.push(`lecture ${lecture.id} / "${section.heading}": an item has no id`);
        } else if (seen.has(item.id)) {
          problems.push(`duplicate item id "${item.id}" (also in lecture ${seen.get(item.id)})`);
        } else {
          seen.set(item.id, lecture.id);
          const expected = `l${lecture.id}-`;
          if (item.id.indexOf(expected) !== 0) {
            problems.push(`${where}: id must start with "${expected}"`);
          }
        }

        if (ITEM_TYPES.indexOf(item.type) === -1) {
          problems.push(`${where}: unknown type "${item.type}"`);
        }
        if (isBlank(item.term)) problems.push(`${where}: term is empty`);
        if (isBlank(item.body)) problems.push(`${where}: body is empty`);

        if (item.type === 'formula') {
          if (isBlank(item.formula)) {
            problems.push(`${where}: type is formula but formula is empty`);
          }
          if (isBlank(item.symbols)) {
            problems.push(`${where}: type is formula but symbols is empty`);
          }
        }
        if (!isBlank(item.formula) && isBlank(item.symbols)) {
          problems.push(`${where}: carries a formula but no symbols explanation`);
        }

        if (!Array.isArray(item.crossRef)) {
          problems.push(`${where}: crossRef must be an array`);
        } else {
          item.crossRef.forEach((key) => {
            if (groupKeys.indexOf(key) === -1) {
              problems.push(`${where}: unknown crossRef key "${key}"`);
            }
          });
        }
      });
    });
  });

  return seen;
}

function checkQuestions(questions, itemIds, lectureIds, problems) {
  const seen = new Set();

  questions.forEach((question) => {
    const where = `question ${question.id || '(missing id)'}`;

    if (isBlank(question.id)) {
      problems.push('a question has no id');
    } else if (seen.has(question.id)) {
      problems.push(`duplicate question id "${question.id}"`);
    } else {
      seen.add(question.id);
      if (!/^l\d+-\d{3}$/.test(question.id)) {
        problems.push(`${where}: id must match l<chapter>-<3 digits>`);
      } else if (question.id.indexOf(`l${question.lecture}-`) !== 0) {
        problems.push(`${where}: id does not match lecture ${question.lecture}`);
      }
    }

    if (lectureIds.indexOf(question.lecture) === -1) {
      problems.push(`${where}: lecture ${question.lecture} has no content chapter`);
    }
    if (isBlank(question.topic)) problems.push(`${where}: topic is empty`);
    if (isBlank(question.question)) problems.push(`${where}: question text is empty`);
    if (isBlank(question.answer)) problems.push(`${where}: answer is empty`);

    if (MODES.indexOf(question.mode) === -1) {
      problems.push(`${where}: unknown mode "${question.mode}"`);
    } else if (question.mode === 'mc') {
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        problems.push(`${where}: mc questions need exactly 4 options`);
      } else {
        question.options.forEach((option, index) => {
          if (isBlank(option)) problems.push(`${where}: option ${index} is empty`);
        });
        const unique = new Set(question.options.map((o) => String(o).trim()));
        if (unique.size !== question.options.length) {
          problems.push(`${where}: duplicate option text`);
        }
        if (!Number.isInteger(question.correctIndex) ||
            question.correctIndex < 0 ||
            question.correctIndex > 3) {
          problems.push(`${where}: correctIndex must be an integer 0-3`);
        }
      }
    } else {
      if (question.options !== undefined) {
        problems.push(`${where}: short questions must not carry options`);
      }
      if (question.correctIndex !== undefined) {
        problems.push(`${where}: short questions must not carry correctIndex`);
      }
    }

    if (isBlank(question.contentRef)) {
      problems.push(`${where}: contentRef is empty`);
    } else if (!itemIds.has(question.contentRef)) {
      problems.push(`${where}: contentRef "${question.contentRef}" matches no item`);
    }
  });
}

function checkCounts(lectures, questions, problems) {
  lectures.forEach((lecture) => {
    let itemCount = 0;
    lecture.sections.forEach((section) => {
      itemCount += (section.items || []).length;
    });
    if (itemCount < MIN_ITEMS || itemCount > MAX_ITEMS) {
      problems.push(
        `chapter ${lecture.id}: ${itemCount} items, target ${MIN_ITEMS}-${MAX_ITEMS}`
      );
    }

    const mine = questions.filter((q) => q.lecture === lecture.id);
    if (mine.length < MIN_QUESTIONS || mine.length > MAX_QUESTIONS) {
      problems.push(
        `chapter ${lecture.id}: ${mine.length} questions, target ${MIN_QUESTIONS}-${MAX_QUESTIONS}`
      );
    }
    if (mine.length > 0) {
      const ratio = mine.filter((q) => q.mode === 'mc').length / mine.length;
      if (ratio < MIN_MC_RATIO || ratio > MAX_MC_RATIO) {
        problems.push(
          `chapter ${lecture.id}: mc ratio ${ratio.toFixed(2)}, target ` +
          `${MIN_MC_RATIO}-${MAX_MC_RATIO}`
        );
      }
    }
  });
}

function checkAll(lectures, questions, groups, options) {
  const opts = options || {};
  const problems = [];
  const groupKeys = groups.map((g) => g.key);

  const itemIds = checkItems(lectures, groupKeys, problems);
  const lectureIds = lectures.map((l) => l.id);
  checkQuestions(questions, itemIds, lectureIds, problems);

  if (opts.countsEnforced !== false) {
    checkCounts(lectures, questions, problems);

    // Group coverage is a whole-bank property, like the per-chapter counts:
    // meaningless for a fixture, and meaningless while the bank is only
    // partly authored. Both are gated by the same flag.
    groupKeys.forEach((key) => {
      let used = false;
      lectures.forEach((lecture) => {
        lecture.sections.forEach((section) => {
          (section.items || []).forEach((item) => {
            if ((item.crossRef || []).indexOf(key) !== -1) used = true;
          });
        });
      });
      if (!used) problems.push(`cross-cutting group "${key}" has no items`);
    });
  }

  return problems;
}

module.exports = { checkAll, ITEM_TYPES, MODES };

if (require.main === module) {
  const { loadBank } = require('./load-bank.js');
  const bank = loadBank();
  const problems = checkAll(bank.lectures, bank.questions, bank.groups, {
    countsEnforced: process.argv.indexOf('--no-counts') === -1
  });

  if (problems.length === 0) {
    let items = 0;
    bank.lectures.forEach((l) => l.sections.forEach((s) => { items += s.items.length; }));
    console.log(
      `ok: ${bank.lectures.length} chapters, ${items} items, ` +
      `${bank.questions.length} questions`
    );
    process.exit(0);
  }

  console.error(`${problems.length} problem(s):`);
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
```

- [ ] **Step 7: Write `tools/load-bank.js`**

The browser gets these globals from `<script>` tags. Node has no such mechanism, so the loader evaluates the plain scripts in one shared sandbox — which is exactly how the browser sees them, and needs no build step.

```js
// tools/load-bank.js
// Evaluate the plain browser scripts in one shared context, the way the
// browser does with sequential <script> tags, and hand back the globals.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

function chapterFiles(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((name) => /^l\d+\.js$/.test(name))
    .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
    .map((name) => path.join(dir, name));
}

function loadBank() {
  const files = ['content.js']
    .concat(chapterFiles('content'))
    .concat(['questions.js'])
    .concat(chapterFiles('questions'));

  const sandbox = vm.createContext({ console: console });

  files.forEach((rel) => {
    const abs = path.join(ROOT, rel);
    const code = fs.readFileSync(abs, 'utf8');
    try {
      vm.runInContext(code, sandbox, { filename: rel });
    } catch (err) {
      throw new Error(`failed to evaluate ${rel}: ${err.message}`);
    }
  });

  return {
    lectures: sandbox.LECTURES,
    questions: sandbox.QUESTIONS,
    groups: sandbox.CROSS_CUTTING,
    files: files
  };
}

module.exports = { loadBank, chapterFiles };
```

The `if (typeof module !== 'undefined')` tails in `content.js` and `questions.js` are inert here, because `module` is undefined inside the sandbox — same as in the browser.

- [ ] **Step 8: Run the tests to verify they pass**

```bash
node --test
```

Expected: PASS, 12 tests.

- [ ] **Step 9: Run the validator against the real (still empty) bank**

```bash
node tools/validate.js --no-counts
```

Expected: exit 0, printing `ok: 0 chapters, 0 items, 0 questions`. Whole-bank checks are suppressed by `--no-counts`, so an empty bank is legitimately clean.

That alone is a weak proof, so confirm the sandbox really evaluated the data files:

```bash
node -e "const {loadBank}=require('./tools/load-bank.js'); const b=loadBank(); console.log(JSON.stringify({chapters:b.lectures.length, questions:b.questions.length, groups:b.groups.length, groupKeys:b.groups.map(g=>g.key)}))"
```

Expected: `chapters:0, questions:0, groups:4`, with `groupKeys` exactly `["bias-variance","convolution","information-loss","separation-of-concerns"]`. This proves `CROSS_CUTTING` was picked up from `content.js` inside the `vm` context, which is what `load-bank.js` exists to do.

- [ ] **Step 10: Commit**

```bash
git add content.js questions.js tools/validate.js tools/load-bank.js tests/
git commit -m "feat: data contract and bank validator with unit tests"
```

---

### Task 3: Exemplar chapter (Lecture 2)

Lecture 2 is the exemplar because it is the densest cross-cutting chapter — it carries `information-loss`, `bias-variance` and `convolution` — so the file it produces exercises every part of the contract the parallel authors in Task 14 must follow.

**Files:**
- Create: `content/l2.js`, `questions/l2.js`
- Modify: `index.html` (uncomment the L2 data scripts)

**Interfaces:**
- Consumes: the schema and id rules from Task 2; `.source/script.txt` from Task 1
- Produces: `content/l2.js` and `questions/l2.js` as the canonical style reference for Task 14; a bank that passes `node tools/validate.js`

- [ ] **Step 1: Read the source material**

Read `.source/script.txt` PDF pages 14–25 (Chapter 2: What a signal is; The time domain; The frequency domain; Filtering; From analog to digital). Then read the Analog-to-digital block of Appendix A on PDF page 95 for the formula inventory this chapter owns.

Then scan `../Applied-Programming-2026/applied_programming_project/Lecture slides/2. Signals & Frequency.pdf` for slide-only material — specifically the NumPy/SciPy idiom that closes each of the lecture's five acts.

- [ ] **Step 2: Write `content/l2.js`**

Structure, with real content filled from Step 1. Sections follow the script's own subsection order so the Reference Bank mirrors the chapter a reader already knows.

```js
LECTURES.push({
  id: 2,
  name: 'Signals: Time, Frequency and the Digital World',
  shortName: 'Signals & Frequency',
  sections: [
    { heading: 'What a signal is', items: [/* … */] },
    { heading: 'The time domain', items: [/* … */] },
    { heading: 'The frequency domain', items: [/* … */] },
    { heading: 'Filtering', items: [/* … */] },
    { heading: 'From analog to digital', items: [/* … */] }
  ]
});
```

Requirements for this file, which double as the contract for Task 14:

- 25–40 items total across the sections.
- Every item: `id`, `type`, `term`, `body`, `formula`, `symbols`, `crossRef` — all seven keys present, `null` where not applicable, `crossRef` always an array (`[]` when none).
- `body` is 1–3 sentences of exam-ready prose. It states the thing, not that the lecture mentioned the thing. No "the lecture explains that…".
- Every `formula` item has both `formula` (LaTeX) and `symbols` (what each symbol means and when the formula applies).
- At minimum these items exist, with these ids, because Task 14's chapters cross-reference them:
  - `l2-nyquist` — `formula`, `f_s > 2 f_{max}`, crossRef `['information-loss']`
  - `l2-aliasing` — `definition`, crossRef `['information-loss']`
  - `l2-antialiasing-analog` — `pitfall`, why the anti-aliasing filter must be analog and precede the ADC, crossRef `['information-loss']`
  - `l2-quantisation-step` — `formula`, `q = V_{FS}/2^n`, crossRef `['information-loss']`
  - `l2-envelope-window` — `distinction`, short versus long moving-average window, crossRef `['bias-variance', 'convolution']`
  - `l2-welch-segment` — `distinction`, segment length against frequency resolution and variance, crossRef `['bias-variance']`
  - `l2-rms` — `formula`
  - `l2-causality` — `fact`, which summaries may be computed in real time
- At least three `pitfall` items, drawn from the chapter's orange boxes.

- [ ] **Step 3: Write `questions/l2.js`**

```js
QUESTIONS.push(
  {
    id: 'l2-001',
    lecture: 2,
    topic: 'aliasing',
    mode: 'mc',
    question: 'Why must anti-aliasing filtering happen in analog hardware, before the ADC, rather than in software afterwards?',
    options: [
      'Digital filters cannot implement a low-pass response',
      'Once sampled, aliased components are indistinguishable from real low-frequency content, so no later filter can separate them',
      'Software filters are too slow to run at the sampling rate',
      'The ADC introduces phase distortion that only an analog filter can correct'
    ],
    correctIndex: 1,
    answer: 'Aliasing folds everything above f_s/2 down into the band of interest at the moment of sampling. After that the aliased energy occupies the same frequencies as genuine signal, so it is not separable by any filter of any order. The only prevention is to remove those frequencies before the sampler sees them, which means analog.',
    contentRef: 'l2-antialiasing-analog'
  }
  /* … 14–19 more … */
);
```

Requirements, also the contract for Task 14:

- 15–20 questions; 55–65% `mode: 'mc'`.
- Sequential ids from `l2-001`.
- `topic` tags are short, reused across chapters where the concept recurs (`aliasing`, `quantisation`, `convolution`, `filtering`, `spectra`, `emg`, `adc`, `arduino`, `mvvm`, …), because they drive the cross-chapter score breakdown.
- MC distractors are plausible near-misses: a common confusion, an adjacent concept, or a true statement that does not answer the question. No filler.
- "Why" and distinction questions preferred over pure recall wherever the script supports it.
- Short-answer `answer` fields are model answers a marker would accept, seeded from the chapter's own end-of-chapter exam questions.
- Every `contentRef` names an id that exists in `content/l2.js`.

- [ ] **Step 4: Wire the data into `index.html`**

Insert before the `lib/` scripts, after `katex.min.js`:

```html
<script src="content.js"></script>
<script src="content/l2.js"></script>
<script src="questions.js"></script>
<script src="questions/l2.js"></script>
```

- [ ] **Step 5: Run the validator**

```bash
node tools/validate.js
```

Expected: **exit 1 with exactly one problem**, `cross-cutting group "separation-of-concerns" has no items`. That is the correct outcome here, not a failure: the required L2 items populate `information-loss`, `bias-variance` and `convolution`, while `separation-of-concerns` spans Lectures 6 and 8 and cannot be populated until Task 14. Passing `--no-counts` is *not* the fix — it would also suppress the per-chapter count check, which is exactly what needs verifying at this step.

So the pass condition is: every reported problem is of the form `cross-cutting group "<key>" has no items`, and no other problem appears. Any problem mentioning an item id, a question id, a `contentRef`, or a count is a real failure. To confirm the counts separately:

```bash
node -e "const {loadBank}=require('./tools/load-bank.js'); const b=loadBank(); const items=b.lectures[0].sections.reduce((n,s)=>n+s.items.length,0); const qs=b.questions.filter(q=>q.lecture===2); const mc=qs.filter(q=>q.mode==='mc').length; console.log(JSON.stringify({items, questions:qs.length, mc, ratio:+(mc/qs.length).toFixed(2)}))"
```

Expected: `items` in 25–40, `questions` in 15–20, `ratio` in 0.55–0.65. Record this line in the commit message.

- [ ] **Step 6: Confirm the data loads in the browser**

Reload `http://localhost:8765/ap-exam-prep/` and evaluate in the page:

```js
[LECTURES.length, LECTURES[0].sections.length, QUESTIONS.length]
```

Expected: `[1, 5, M]`. Console clean.

- [ ] **Step 7: Commit**

```bash
git add content/l2.js questions/l2.js index.html
git commit -m "content: author Lecture 2 as the exemplar chapter"
```

---

### Task 4: `lib/content-index.js`

**Files:**
- Create: `lib/content-index.js`, `tests/content-index.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: the `LECTURES` shape from Task 2
- Produces: global `ContentIndex` with
  - `flatten(lectures)` → array of items each extended with `lectureId`, `lectureName`, `lectureShortName`, `sectionHeading`
  - `byId(lectures)` → `Map<string, item>`
  - `byCrossRef(lectures, key)` → array of flattened items carrying that key, in lecture order
  - `groupByLecture(items)` → array of `{lectureId, lectureShortName, items}`, in ascending lecture order

- [ ] **Step 1: Write the failing test**

```js
// tests/content-index.test.js
const test = require('node:test');
const assert = require('node:assert');
const ContentIndex = require('../lib/content-index.js');

const LECTURES = [
  {
    id: 2,
    name: 'Signals',
    shortName: 'Sig',
    sections: [
      {
        heading: 'Sampling',
        items: [
          { id: 'l2-nyquist', term: 'Nyquist', crossRef: ['information-loss'] },
          { id: 'l2-rms', term: 'RMS', crossRef: [] }
        ]
      }
    ]
  },
  {
    id: 6,
    name: 'ADC',
    shortName: 'ADC',
    sections: [
      {
        heading: 'Conversion',
        items: [
          { id: 'l6-lsb', term: 'LSB', crossRef: ['information-loss'] }
        ]
      }
    ]
  }
];

test('flatten returns every item with its lecture and section context', () => {
  const flat = ContentIndex.flatten(LECTURES);
  assert.strictEqual(flat.length, 3);
  assert.strictEqual(flat[0].id, 'l2-nyquist');
  assert.strictEqual(flat[0].lectureId, 2);
  assert.strictEqual(flat[0].lectureShortName, 'Sig');
  assert.strictEqual(flat[0].sectionHeading, 'Sampling');
});

test('flatten does not mutate the source items', () => {
  ContentIndex.flatten(LECTURES);
  assert.strictEqual(LECTURES[0].sections[0].items[0].lectureId, undefined);
});

test('byId maps every item id to its item', () => {
  const map = ContentIndex.byId(LECTURES);
  assert.strictEqual(map.size, 3);
  assert.strictEqual(map.get('l6-lsb').term, 'LSB');
  assert.strictEqual(map.get('nope'), undefined);
});

test('byCrossRef gathers items across lectures in lecture order', () => {
  const hits = ContentIndex.byCrossRef(LECTURES, 'information-loss');
  assert.deepStrictEqual(hits.map((i) => i.id), ['l2-nyquist', 'l6-lsb']);
});

test('byCrossRef returns empty for an unused key', () => {
  assert.deepStrictEqual(ContentIndex.byCrossRef(LECTURES, 'convolution'), []);
});

test('groupByLecture buckets flattened items by lecture', () => {
  const groups = ContentIndex.groupByLecture(
    ContentIndex.byCrossRef(LECTURES, 'information-loss')
  );
  assert.deepStrictEqual(groups.map((g) => g.lectureId), [2, 6]);
  assert.strictEqual(groups[0].lectureShortName, 'Sig');
  assert.strictEqual(groups[0].items.length, 1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --test tests/content-index.test.js
```

Expected: FAIL, `Cannot find module '../lib/content-index.js'`.

- [ ] **Step 3: Write `lib/content-index.js`**

```js
// Flatten and index the content bank. No DOM access.
var ContentIndex = (function () {
  'use strict';

  function flatten(lectures) {
    var out = [];
    lectures.forEach(function (lecture) {
      (lecture.sections || []).forEach(function (section) {
        (section.items || []).forEach(function (item) {
          var copy = {};
          Object.keys(item).forEach(function (key) { copy[key] = item[key]; });
          copy.lectureId = lecture.id;
          copy.lectureName = lecture.name;
          copy.lectureShortName = lecture.shortName;
          copy.sectionHeading = section.heading;
          out.push(copy);
        });
      });
    });
    return out;
  }

  function byId(lectures) {
    var map = new Map();
    flatten(lectures).forEach(function (item) { map.set(item.id, item); });
    return map;
  }

  function byCrossRef(lectures, key) {
    return flatten(lectures).filter(function (item) {
      return (item.crossRef || []).indexOf(key) !== -1;
    });
  }

  function groupByLecture(items) {
    var order = [];
    var buckets = {};
    items.forEach(function (item) {
      if (!buckets[item.lectureId]) {
        buckets[item.lectureId] = {
          lectureId: item.lectureId,
          lectureName: item.lectureName,
          lectureShortName: item.lectureShortName,
          items: []
        };
        order.push(item.lectureId);
      }
      buckets[item.lectureId].items.push(item);
    });
    order.sort(function (a, b) { return a - b; });
    return order.map(function (id) { return buckets[id]; });
  }

  return {
    flatten: flatten,
    byId: byId,
    byCrossRef: byCrossRef,
    groupByLecture: groupByLecture
  };
})();

if (typeof module !== 'undefined') module.exports = ContentIndex;
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
node --test tests/content-index.test.js
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Add the script tag to `index.html`**

Insert after the question data scripts:

```html
<script src="lib/content-index.js"></script>
```

- [ ] **Step 6: Commit**

```bash
git add lib/content-index.js tests/content-index.test.js index.html
git commit -m "feat: content index helpers with unit tests"
```

---

### Task 5: `lib/search.js`

**Files:**
- Create: `lib/search.js`, `tests/search.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `ContentIndex.flatten` output shape from Task 4
- Produces: global `Search` with
  - `normalize(text)` → lowercased, diacritic-stripped string
  - `build(flatItems)` → opaque index array
  - `query(index, text)` → array of items, term-field matches first, `[]` for blank input

- [ ] **Step 1: Write the failing test**

```js
// tests/search.test.js
const test = require('node:test');
const assert = require('node:assert');
const Search = require('../lib/search.js');

const ITEMS = [
  {
    id: 'l2-nyquist',
    type: 'formula',
    term: 'Nyquist–Shannon sampling theorem',
    // Mentions "aliasing" so the ranking test below has a body-only match to
    // rank beneath the term match. The literal substring matters.
    body: 'Sample above twice the highest frequency present; below that rate, aliasing is unavoidable.',
    symbols: 'f_s is the sampling rate.',
    sectionHeading: 'From analog to digital',
    lectureName: 'Signals'
  },
  {
    id: 'l2-aliasing',
    type: 'definition',
    term: 'Aliasing',
    body: 'Energy above the Nyquist frequency folds down and cannot be recovered.',
    symbols: null,
    sectionHeading: 'From analog to digital',
    lectureName: 'Signals'
  },
  {
    id: 'l1-torque',
    type: 'formula',
    term: 'Drehmoment (torque)',
    body: 'The moment of a force about a joint axis.',
    symbols: 'r is the lever arm.',
    sectionHeading: 'Torque',
    lectureName: 'Biomechanics'
  }
];

test('blank and whitespace queries return nothing', () => {
  const index = Search.build(ITEMS);
  assert.deepStrictEqual(Search.query(index, ''), []);
  assert.deepStrictEqual(Search.query(index, '   '), []);
});

test('a term match is found case-insensitively', () => {
  const index = Search.build(ITEMS);
  assert.deepStrictEqual(Search.query(index, 'ALIASING').map((i) => i.id), [
    'l2-aliasing',
    'l2-nyquist'
  ]);
});

test('term-field matches rank above body-only matches', () => {
  const index = Search.build(ITEMS);
  const hits = Search.query(index, 'aliasing');
  assert.strictEqual(hits[0].id, 'l2-aliasing');
});

test('body text is searchable', () => {
  const index = Search.build(ITEMS);
  assert.deepStrictEqual(Search.query(index, 'lever arm').map((i) => i.id), ['l1-torque']);
});

test('all terms must match, not just one', () => {
  const index = Search.build(ITEMS);
  assert.deepStrictEqual(Search.query(index, 'nyquist torque'), []);
});

test('diacritics are ignored so umlauts are searchable either way', () => {
  const index = Search.build([
    { id: 'x', term: 'Kräfte', body: 'Forces.', symbols: null, sectionHeading: '', lectureName: '' }
  ]);
  assert.strictEqual(Search.query(index, 'krafte').length, 1);
  assert.strictEqual(Search.query(index, 'kräfte').length, 1);
});

test('the type is searchable, so "pitfall" surfaces the pitfalls', () => {
  const index = Search.build([
    { id: 'p', type: 'pitfall', term: 'A trap', body: 'Do not do this.', symbols: null, sectionHeading: '', lectureName: '' }
  ]);
  assert.strictEqual(Search.query(index, 'pitfall').length, 1);
});

test('a null symbols field does not break the haystack', () => {
  const index = Search.build(ITEMS);
  assert.strictEqual(Search.query(index, 'null').length, 0);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --test tests/search.test.js
```

Expected: FAIL, `Cannot find module '../lib/search.js'`.

- [ ] **Step 3: Write `lib/search.js`**

```js
// Substring search over flattened content items. No DOM access.
var Search = (function () {
  'use strict';

  function normalize(text) {
    return String(text == null ? '' : text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function build(items) {
    return items.map(function (item) {
      var parts = [
        item.term,
        item.body,
        item.symbols,
        item.type,
        item.sectionHeading,
        item.lectureName
      ];
      var haystack = normalize(
        parts.filter(function (p) { return p != null; }).join(' ')
      );
      return { item: item, haystack: haystack, termField: normalize(item.term) };
    });
  }

  function query(index, text) {
    var terms = normalize(text).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    var hits = [];
    index.forEach(function (entry) {
      var matchesAll = terms.every(function (term) {
        return entry.haystack.indexOf(term) !== -1;
      });
      if (!matchesAll) return;

      var inTerm = terms.every(function (term) {
        return entry.termField.indexOf(term) !== -1;
      });
      hits.push({ item: entry.item, score: inTerm ? 2 : 1 });
    });

    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.map(function (hit) { return hit.item; });
  }

  return { normalize: normalize, build: build, query: query };
})();

if (typeof module !== 'undefined') module.exports = Search;
```

`Array.prototype.sort` is stable in every engine this targets, so equal-score hits keep their lecture order.

- [ ] **Step 4: Run the test to verify it passes**

```bash
node --test tests/search.test.js
```

Expected: PASS, 8 tests.

- [ ] **Step 5: Add the script tag to `index.html`**

```html
<script src="lib/search.js"></script>
```

- [ ] **Step 6: Commit**

```bash
git add lib/search.js tests/search.test.js index.html
git commit -m "feat: content search with diacritic folding and term-first ranking"
```

---

### Task 6: `lib/quiz-engine.js`

**Files:**
- Create: `lib/quiz-engine.js`, `tests/quiz-engine.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: the `QUESTIONS` shape from Task 2
- Produces: global `QuizEngine` with
  - `shuffle(array, rng)` → the same array, shuffled in place
  - `build(questions, {lectures, mode, rng})` → shuffled question array; `lectures` is an array of ids or the string `'all'`; `mode` is `'mc'`, `'short'` or `'mixed'`
  - `create(questionSet)` → session object: `total`, `current()`, `position()`, `record(correct)`, `isDone()`, `results()`, `summary()`
  - `summarize(results)` → `{total, correct, byLecture, byTopic, missed}` where the two maps hold `{correct, total}` per key

- [ ] **Step 1: Write the failing test**

```js
// tests/quiz-engine.test.js
const test = require('node:test');
const assert = require('node:assert');
const QuizEngine = require('../lib/quiz-engine.js');

const QUESTIONS = [
  { id: 'l2-001', lecture: 2, topic: 'aliasing', mode: 'mc' },
  { id: 'l2-002', lecture: 2, topic: 'aliasing', mode: 'short' },
  { id: 'l2-003', lecture: 2, topic: 'spectra', mode: 'mc' },
  { id: 'l6-001', lecture: 6, topic: 'adc', mode: 'mc' },
  { id: 'l6-002', lecture: 6, topic: 'adc', mode: 'short' }
];

// Deterministic: always picks the last remaining index, so shuffle is identity.
const stableRng = () => 0.999999;

test('scope "all" with mixed mode keeps every question', () => {
  const set = QuizEngine.build(QUESTIONS, { lectures: 'all', mode: 'mixed', rng: stableRng });
  assert.strictEqual(set.length, 5);
});

test('a lecture scope filters by lecture', () => {
  const set = QuizEngine.build(QUESTIONS, { lectures: [6], mode: 'mixed', rng: stableRng });
  assert.deepStrictEqual(set.map((q) => q.id).sort(), ['l6-001', 'l6-002']);
});

test('multiple lectures can be selected', () => {
  const set = QuizEngine.build(QUESTIONS, { lectures: [2, 6], mode: 'mc', rng: stableRng });
  assert.strictEqual(set.length, 3);
});

test('mode mc excludes short questions', () => {
  const set = QuizEngine.build(QUESTIONS, { lectures: 'all', mode: 'mc', rng: stableRng });
  assert.ok(set.every((q) => q.mode === 'mc'));
  assert.strictEqual(set.length, 3);
});

test('mode short excludes mc questions', () => {
  const set = QuizEngine.build(QUESTIONS, { lectures: 'all', mode: 'short', rng: stableRng });
  assert.ok(set.every((q) => q.mode === 'short'));
  assert.strictEqual(set.length, 2);
});

test('build does not mutate the source array', () => {
  const before = QUESTIONS.map((q) => q.id);
  QuizEngine.build(QUESTIONS, { lectures: 'all', mode: 'mixed', rng: Math.random });
  assert.deepStrictEqual(QUESTIONS.map((q) => q.id), before);
});

test('an empty scope yields an empty set rather than throwing', () => {
  const set = QuizEngine.build(QUESTIONS, { lectures: [], mode: 'mixed', rng: stableRng });
  assert.deepStrictEqual(set, []);
});

test('shuffle with a deterministic rng is reproducible', () => {
  let calls = 0;
  const rng = () => { calls += 1; return 0; };
  const a = QuizEngine.shuffle([1, 2, 3, 4], rng);
  assert.deepStrictEqual(a, [2, 3, 4, 1]);
  assert.strictEqual(calls, 3);
});

test('a session walks forward and reports completion', () => {
  const session = QuizEngine.create(QUESTIONS.slice(0, 2));
  assert.strictEqual(session.total, 2);
  assert.strictEqual(session.position(), 0);
  assert.strictEqual(session.current().id, 'l2-001');
  assert.strictEqual(session.isDone(), false);

  session.record(true);
  assert.strictEqual(session.position(), 1);
  assert.strictEqual(session.current().id, 'l2-002');

  session.record(false);
  assert.strictEqual(session.isDone(), true);
  assert.strictEqual(session.current(), null);
});

test('recording past the end is ignored', () => {
  const session = QuizEngine.create(QUESTIONS.slice(0, 1));
  session.record(true);
  session.record(true);
  assert.strictEqual(session.results().length, 1);
});

test('summary splits the score by lecture and by topic', () => {
  const session = QuizEngine.create(QUESTIONS);
  session.record(true);   // l2-001 aliasing
  session.record(false);  // l2-002 aliasing
  session.record(true);   // l2-003 spectra
  session.record(false);  // l6-001 adc
  session.record(false);  // l6-002 adc

  const summary = session.summary();
  assert.strictEqual(summary.total, 5);
  assert.strictEqual(summary.correct, 2);
  assert.deepStrictEqual(summary.byLecture[2], { correct: 2, total: 3 });
  assert.deepStrictEqual(summary.byLecture[6], { correct: 0, total: 2 });
  assert.deepStrictEqual(summary.byTopic.aliasing, { correct: 1, total: 2 });
  assert.deepStrictEqual(summary.byTopic.adc, { correct: 0, total: 2 });
  assert.deepStrictEqual(summary.missed.map((q) => q.id), ['l2-002', 'l6-001', 'l6-002']);
});

test('the missed list feeds straight back into a retry session', () => {
  const first = QuizEngine.create(QUESTIONS.slice(0, 3));
  first.record(false);
  first.record(true);
  first.record(false);

  const retry = QuizEngine.create(first.summary().missed);
  assert.deepStrictEqual(retry.total, 2);
  assert.strictEqual(retry.current().id, 'l2-001');
});

test('results is a copy, so callers cannot corrupt the session', () => {
  const session = QuizEngine.create(QUESTIONS.slice(0, 1));
  session.record(true);
  session.results().push({ bogus: true });
  assert.strictEqual(session.results().length, 1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --test tests/quiz-engine.test.js
```

Expected: FAIL, `Cannot find module '../lib/quiz-engine.js'`.

- [ ] **Step 3: Write `lib/quiz-engine.js`**

```js
// Question set building, session tracking and scoring. No DOM access.
var QuizEngine = (function () {
  'use strict';

  function shuffle(array, rng) {
    var random = rng || Math.random;
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var swap = array[i];
      array[i] = array[j];
      array[j] = swap;
    }
    return array;
  }

  function build(questions, options) {
    var scope = options.lectures;
    var mode = options.mode;

    var pool = questions.filter(function (question) {
      var lectureOk = scope === 'all' || scope.indexOf(question.lecture) !== -1;
      var modeOk = mode === 'mixed' || question.mode === mode;
      return lectureOk && modeOk;
    });

    return shuffle(pool, options.rng);
  }

  function bump(accumulator, key, correct) {
    if (!accumulator[key]) accumulator[key] = { correct: 0, total: 0 };
    accumulator[key].total += 1;
    if (correct) accumulator[key].correct += 1;
  }

  function summarize(results) {
    var byLecture = {};
    var byTopic = {};
    var correct = 0;

    results.forEach(function (result) {
      if (result.correct) correct += 1;
      bump(byLecture, result.question.lecture, result.correct);
      bump(byTopic, result.question.topic, result.correct);
    });

    return {
      total: results.length,
      correct: correct,
      byLecture: byLecture,
      byTopic: byTopic,
      missed: results
        .filter(function (result) { return !result.correct; })
        .map(function (result) { return result.question; })
    };
  }

  function create(questionSet) {
    var index = 0;
    var results = [];

    return {
      total: questionSet.length,
      current: function () {
        return index < questionSet.length ? questionSet[index] : null;
      },
      position: function () { return index; },
      record: function (correct) {
        if (index >= questionSet.length) return;
        results.push({ question: questionSet[index], correct: !!correct });
        index += 1;
      },
      isDone: function () { return index >= questionSet.length; },
      results: function () { return results.slice(); },
      summary: function () { return summarize(results); }
    };
  }

  return { shuffle: shuffle, build: build, create: create, summarize: summarize };
})();

if (typeof module !== 'undefined') module.exports = QuizEngine;
```

`filter` already returns a fresh array, so shuffling it in place cannot touch the caller's `questions`.

- [ ] **Step 4: Run the test to verify it passes**

```bash
node --test tests/quiz-engine.test.js
```

Expected: PASS, 13 tests.

- [ ] **Step 5: Add the script tag to `index.html`**

```html
<script src="lib/quiz-engine.js"></script>
```

- [ ] **Step 6: Commit**

```bash
git add lib/quiz-engine.js tests/quiz-engine.test.js index.html
git commit -m "feat: quiz engine with scope filtering, scoring and topic breakdown"
```

---

### Task 7: `lib/progress-store.js`

**Files:**
- Create: `lib/progress-store.js`, `tests/progress-store.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: the `summary()` shape from Task 6 (`{total, correct, byLecture, byTopic, missed}`)
- Produces: global `ProgressStore` with `ProgressStore.create(storage)` → store object:
  - `isPersistent()` → boolean; false when storage threw or is absent
  - `attempts()` → array of attempt records, oldest first
  - `addAttempt(summary, scope, at)` → the stored record; `at` is an ISO string, defaulting to now
  - `topicAccuracy()` → `{topic: {correct, total}}` summed across all attempts
  - `lectureAccuracy()` → `{lectureId: {correct, total}}` summed across all attempts
  - `reset()` → clears everything
  - `exportJSON()` → pretty-printed JSON string
  - `importJSON(text)` → `{added, skipped}`; throws `Error` on malformed input
- Attempt record shape: `{at, scope: {lectures, mode}, total, correct, byTopic, byLecture}`

`storage` is injected rather than reached for, so the tests can drive a fake and a throwing fake without a browser.

- [ ] **Step 1: Write the failing test**

```js
// tests/progress-store.test.js
const test = require('node:test');
const assert = require('node:assert');
const ProgressStore = require('../lib/progress-store.js');

function fakeStorage(initial) {
  const data = Object.assign({}, initial);
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    _data: data
  };
}

function throwingStorage() {
  return {
    getItem: () => { throw new Error('denied'); },
    setItem: () => { throw new Error('denied'); },
    removeItem: () => { throw new Error('denied'); }
  };
}

const SUMMARY = {
  total: 4,
  correct: 3,
  byLecture: { 2: { correct: 2, total: 2 }, 6: { correct: 1, total: 2 } },
  byTopic: { aliasing: { correct: 2, total: 2 }, adc: { correct: 1, total: 2 } },
  missed: [{ id: 'l6-002' }]
};

const SCOPE = { lectures: [2, 6], mode: 'mixed' };

test('a fresh store has no attempts', () => {
  const store = ProgressStore.create(fakeStorage());
  assert.deepStrictEqual(store.attempts(), []);
  assert.strictEqual(store.isPersistent(), true);
});

test('an attempt is recorded and read back', () => {
  const store = ProgressStore.create(fakeStorage());
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');

  const attempts = store.attempts();
  assert.strictEqual(attempts.length, 1);
  assert.strictEqual(attempts[0].at, '2026-09-17T10:00:00.000Z');
  assert.strictEqual(attempts[0].correct, 3);
  assert.strictEqual(attempts[0].total, 4);
  assert.deepStrictEqual(attempts[0].scope, SCOPE);
});

test('the missed list is not persisted, only the counts', () => {
  const store = ProgressStore.create(fakeStorage());
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  assert.strictEqual(store.attempts()[0].missed, undefined);
});

test('attempts survive a new store over the same storage', () => {
  const storage = fakeStorage();
  ProgressStore.create(storage).addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  assert.strictEqual(ProgressStore.create(storage).attempts().length, 1);
});

test('attempts are returned oldest first regardless of insertion order', () => {
  const store = ProgressStore.create(fakeStorage());
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T12:00:00.000Z');
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T09:00:00.000Z');
  assert.deepStrictEqual(store.attempts().map((a) => a.at), [
    '2026-09-17T09:00:00.000Z',
    '2026-09-17T12:00:00.000Z'
  ]);
});

test('topic accuracy accumulates across attempts', () => {
  const store = ProgressStore.create(fakeStorage());
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T11:00:00.000Z');

  assert.deepStrictEqual(store.topicAccuracy().aliasing, { correct: 4, total: 4 });
  assert.deepStrictEqual(store.topicAccuracy().adc, { correct: 2, total: 4 });
});

test('lecture accuracy accumulates across attempts', () => {
  const store = ProgressStore.create(fakeStorage());
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  assert.deepStrictEqual(store.lectureAccuracy()[6], { correct: 1, total: 2 });
});

test('reset clears everything', () => {
  const store = ProgressStore.create(fakeStorage());
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  store.reset();
  assert.deepStrictEqual(store.attempts(), []);
  assert.deepStrictEqual(store.topicAccuracy(), {});
});

test('export produces re-importable JSON', () => {
  const store = ProgressStore.create(fakeStorage());
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');

  const exported = store.exportJSON();
  const parsed = JSON.parse(exported);
  assert.strictEqual(parsed.version, 1);
  assert.strictEqual(parsed.attempts.length, 1);
});

test('import merges rather than replacing', () => {
  const source = ProgressStore.create(fakeStorage());
  source.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  const payload = source.exportJSON();

  const target = ProgressStore.create(fakeStorage());
  target.addAttempt(SUMMARY, SCOPE, '2026-09-18T10:00:00.000Z');

  const result = target.importJSON(payload);
  assert.deepStrictEqual(result, { added: 1, skipped: 0 });
  assert.deepStrictEqual(target.attempts().map((a) => a.at), [
    '2026-09-17T10:00:00.000Z',
    '2026-09-18T10:00:00.000Z'
  ]);
});

test('importing the same export twice adds nothing the second time', () => {
  const store = ProgressStore.create(fakeStorage());
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  const payload = store.exportJSON();

  assert.deepStrictEqual(store.importJSON(payload), { added: 0, skipped: 1 });
  assert.strictEqual(store.attempts().length, 1);
});

test('malformed import input throws a useful error', () => {
  const store = ProgressStore.create(fakeStorage());
  assert.throws(() => store.importJSON('not json'), /could not be read/i);
  assert.throws(() => store.importJSON('{"version":1}'), /attempts/i);
  assert.throws(() => store.importJSON('{"version":99,"attempts":[]}'), /version/i);
});

test('an attempt missing required fields is rejected on import', () => {
  const store = ProgressStore.create(fakeStorage());
  assert.throws(
    () => store.importJSON('{"version":1,"attempts":[{"correct":1}]}'),
    /attempt/i
  );
});

test('corrupt stored data degrades to empty rather than throwing', () => {
  const storage = fakeStorage({ 'ap-exam-prep/progress/v1': '{not valid' });
  const store = ProgressStore.create(storage);
  assert.deepStrictEqual(store.attempts(), []);
});

test('a throwing storage falls back to session-only memory', () => {
  const store = ProgressStore.create(throwingStorage());
  assert.strictEqual(store.isPersistent(), false);

  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  assert.strictEqual(store.attempts().length, 1);
  assert.deepStrictEqual(store.topicAccuracy().aliasing, { correct: 2, total: 2 });
});

test('a null storage is handled the same way', () => {
  const store = ProgressStore.create(null);
  assert.strictEqual(store.isPersistent(), false);
  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  assert.strictEqual(store.attempts().length, 1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --test tests/progress-store.test.js
```

Expected: FAIL, `Cannot find module '../lib/progress-store.js'`.

- [ ] **Step 3: Write `lib/progress-store.js`**

```js
// Attempt persistence and accuracy roll-ups. No DOM access; storage injected.
var ProgressStore = (function () {
  'use strict';

  var KEY = 'ap-exam-prep/progress/v1';
  var VERSION = 1;

  function probe(storage) {
    if (!storage) return false;
    try {
      var canary = KEY + '/probe';
      storage.setItem(canary, '1');
      storage.getItem(canary);   // reads can fail independently of writes
      storage.removeItem(canary);
      return true;
    } catch (err) {
      return false;
    }
  }

  function validAttempt(attempt) {
    return attempt &&
      typeof attempt.at === 'string' &&
      attempt.at !== '' &&
      typeof attempt.total === 'number' &&
      typeof attempt.correct === 'number';
  }

  function sortAttempts(attempts) {
    return attempts.slice().sort(function (a, b) {
      return a.at < b.at ? -1 : (a.at > b.at ? 1 : 0);
    });
  }

  function accumulate(attempts, field) {
    var totals = {};
    attempts.forEach(function (attempt) {
      var buckets = attempt[field] || {};
      Object.keys(buckets).forEach(function (key) {
        if (!totals[key]) totals[key] = { correct: 0, total: 0 };
        totals[key].correct += buckets[key].correct || 0;
        totals[key].total += buckets[key].total || 0;
      });
    });
    return totals;
  }

  function create(storage) {
    var persistent = probe(storage);
    var memory = { version: VERSION, attempts: [] };

    // Two failure modes that must stay distinct: storage that cannot be read
    // at all (demote to memory), versus a corrupt payload in working storage
    // (stay persistent, start clean). Collapsing them either loses working
    // persistence on junk data, or keeps claiming persistence on a storage
    // whose reads throw — which silently shows the user no progress at all.
    function read() {
      if (!persistent) return memory;

      var raw;
      try {
        raw = storage.getItem(KEY);
      } catch (err) {
        persistent = false;
        return memory;
      }

      if (!raw) return { version: VERSION, attempts: [] };

      try {
        var parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.attempts)) {
          return { version: VERSION, attempts: [] };
        }
        return { version: VERSION, attempts: parsed.attempts.filter(validAttempt) };
      } catch (err) {
        return { version: VERSION, attempts: [] };
      }
    }

    function write(state) {
      if (!persistent) { memory = state; return false; }
      try {
        storage.setItem(KEY, JSON.stringify(state));
        return true;
      } catch (err) {
        // Quota exceeded or storage revoked mid-session: keep working in memory.
        persistent = false;
        memory = state;
        return false;
      }
    }

    function attempts() {
      return sortAttempts(read().attempts);
    }

    function addAttempt(summary, scope, at) {
      var record = {
        at: at || new Date().toISOString(),
        scope: { lectures: scope.lectures, mode: scope.mode },
        total: summary.total,
        correct: summary.correct,
        byTopic: summary.byTopic || {},
        byLecture: summary.byLecture || {}
      };
      var state = read();
      state.attempts.push(record);
      write(state);
      return record;
    }

    function importJSON(text) {
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        throw new Error('That file could not be read as JSON.');
      }
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('That file could not be read as progress data.');
      }
      if (parsed.version !== VERSION) {
        throw new Error(
          'Unsupported progress version ' + parsed.version + '; expected ' + VERSION + '.'
        );
      }
      if (!Array.isArray(parsed.attempts)) {
        throw new Error('That file has no attempts array.');
      }
      parsed.attempts.forEach(function (attempt, index) {
        if (!validAttempt(attempt)) {
          throw new Error('Attempt ' + index + ' is missing required fields.');
        }
      });

      var state = read();
      var known = {};
      state.attempts.forEach(function (attempt) { known[attempt.at] = true; });

      var added = 0;
      var skipped = 0;
      parsed.attempts.forEach(function (attempt) {
        if (known[attempt.at]) { skipped += 1; return; }
        known[attempt.at] = true;
        state.attempts.push(attempt);
        added += 1;
      });

      write(state);
      return { added: added, skipped: skipped };
    }

    return {
      isPersistent: function () { return persistent; },
      attempts: attempts,
      addAttempt: addAttempt,
      topicAccuracy: function () { return accumulate(attempts(), 'byTopic'); },
      lectureAccuracy: function () { return accumulate(attempts(), 'byLecture'); },
      reset: function () {
        memory = { version: VERSION, attempts: [] };
        if (persistent) {
          try { storage.removeItem(KEY); } catch (err) { persistent = false; }
        }
      },
      exportJSON: function () {
        return JSON.stringify(
          { version: VERSION, exportedAt: new Date().toISOString(), attempts: attempts() },
          null,
          2
        );
      },
      importJSON: importJSON
    };
  }

  return { create: create, KEY: KEY, VERSION: VERSION };
})();

if (typeof module !== 'undefined') module.exports = ProgressStore;
```

Dedup is by `at`, the ISO timestamp, which is why `addAttempt` records it to millisecond precision — two attempts finished in the same millisecond on the same device is not a case worth engineering around.

- [ ] **Step 4: Run the test to verify it passes**

```bash
node --test tests/progress-store.test.js
```

Expected: PASS, 16 tests.

- [ ] **Step 5: Add the script tag to `index.html`**

```html
<script src="lib/progress-store.js"></script>
```

- [ ] **Step 6: Commit**

```bash
git add lib/progress-store.js tests/progress-store.test.js index.html
git commit -m "feat: progress store with merge-on-import and storage fallback"
```

---

### Task 8: `lib/router.js` and the real `app.js`

**Files:**
- Create: `lib/router.js`, `tests/router.test.js`
- Modify: `app.js` (replace the Task 1 KaTeX probe entirely), `index.html`, `style.css`

**Interfaces:**
- Consumes: nothing from Tasks 4–7 beyond their globals existing
- Produces:
  - global `Router` with `parse(hash)` → `{view, param}` and `format(view, param)` → hash string
  - global `App` with `App.store` (the shared `ProgressStore` instance) and `App.go(view, param)` for cross-view navigation
  - a `window.APP_VIEWS` registry that Tasks 9–11 populate: `APP_VIEWS[name] = {render: function (mount, param) {}}`

- [ ] **Step 1: Write the failing test**

```js
// tests/router.test.js
const test = require('node:test');
const assert = require('node:assert');
const Router = require('../lib/router.js');

test('an empty hash defaults to the reference view', () => {
  assert.deepStrictEqual(Router.parse(''), { view: 'reference', param: null });
  assert.deepStrictEqual(Router.parse('#'), { view: 'reference', param: null });
  assert.deepStrictEqual(Router.parse('#/'), { view: 'reference', param: null });
});

test('each known view parses', () => {
  assert.strictEqual(Router.parse('#/quiz').view, 'quiz');
  assert.strictEqual(Router.parse('#/progress').view, 'progress');
  assert.strictEqual(Router.parse('#/reference').view, 'reference');
});

test('an unknown view falls back to reference rather than blanking the app', () => {
  assert.deepStrictEqual(Router.parse('#/nonsense'), { view: 'reference', param: null });
});

test('a deep link carries its param', () => {
  assert.deepStrictEqual(Router.parse('#/reference/l2-nyquist'), {
    view: 'reference',
    param: 'l2-nyquist'
  });
});

test('params are percent-decoded', () => {
  assert.strictEqual(Router.parse('#/reference/l2%2Dnyquist').param, 'l2-nyquist');
});

test('a malformed percent-escape does not throw', () => {
  assert.strictEqual(Router.parse('#/reference/%E0%A4%A').param, '%E0%A4%A');
});

test('extra path segments are ignored', () => {
  assert.deepStrictEqual(Router.parse('#/quiz/a/b/c'), { view: 'quiz', param: 'a' });
});

test('format builds hashes that parse back', () => {
  assert.strictEqual(Router.format('quiz', null), '#/quiz');
  assert.strictEqual(Router.format('reference', 'l2-nyquist'), '#/reference/l2-nyquist');
  assert.deepStrictEqual(Router.parse(Router.format('reference', 'l6-lsb')), {
    view: 'reference',
    param: 'l6-lsb'
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --test tests/router.test.js
```

Expected: FAIL, `Cannot find module '../lib/router.js'`.

- [ ] **Step 3: Write `lib/router.js`**

```js
// Hash route parsing. Hash rather than path because GitHub Pages cannot
// rewrite unknown paths to index.html, so a path route would 404 on reload.
var Router = (function () {
  'use strict';

  var VIEWS = ['reference', 'quiz', 'progress'];

  function decode(segment) {
    try {
      return decodeURIComponent(segment);
    } catch (err) {
      return segment;
    }
  }

  function parse(hash) {
    var raw = String(hash == null ? '' : hash).replace(/^#/, '').replace(/^\//, '');
    var parts = raw.split('/').filter(Boolean);
    var view = parts[0];

    if (VIEWS.indexOf(view) === -1) {
      return { view: 'reference', param: null };
    }
    return { view: view, param: parts[1] ? decode(parts[1]) : null };
  }

  function format(view, param) {
    return param ? '#/' + view + '/' + encodeURIComponent(param) : '#/' + view;
  }

  return { parse: parse, format: format, VIEWS: VIEWS };
})();

if (typeof module !== 'undefined') module.exports = Router;
```

`encodeURIComponent` leaves `-` untouched, so `l2-nyquist` round-trips unescaped and the URL stays readable.

- [ ] **Step 4: Run the test to verify it passes**

```bash
node --test tests/router.test.js
```

Expected: PASS, 8 tests.

- [ ] **Step 5: Replace `app.js` entirely**

The Task 1 KaTeX probe goes away; this is the real boot.

```js
// Boot, routing and view mounting. No business logic lives here.
var App = (function () {
  'use strict';

  var APP_VIEWS = {};
  var mount = null;
  var store = null;

  function safeStorage() {
    try {
      return window.localStorage;
    } catch (err) {
      // Safari in private mode throws on property access, not just on use.
      return null;
    }
  }

  function setActiveTab(view) {
    var tabs = document.querySelectorAll('.tab');
    Array.prototype.forEach.call(tabs, function (tab) {
      if (tab.getAttribute('data-view') === view) {
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.removeAttribute('aria-current');
      }
    });
  }

  function render() {
    var route = Router.parse(window.location.hash);
    var view = APP_VIEWS[route.view];

    setActiveTab(route.view);
    mount.innerHTML = '';

    if (!view) {
      var missing = document.createElement('p');
      missing.className = 'empty';
      missing.textContent = 'This view is not available.';
      mount.appendChild(missing);
      return;
    }

    // Reset scroll BEFORE rendering: a view may scroll a deep-linked item into
    // view during its own render, and resetting afterwards would undo it.
    mount.scrollTop = 0;
    window.scrollTo(0, 0);

    view.render(mount, route.param);
  }

  function go(view, param) {
    var next = Router.format(view, param);
    if (window.location.hash === next) {
      render();   // same hash fires no hashchange, so re-render by hand
    } else {
      window.location.hash = next;
    }
  }

  function register(name, view) {
    APP_VIEWS[name] = view;
  }

  function boot() {
    mount = document.getElementById('main');
    store = ProgressStore.create(safeStorage());

    if (!store.isPersistent()) {
      var notice = document.createElement('p');
      notice.className = 'notice';
      notice.textContent =
        'Storage is unavailable, so progress will be kept for this session only.';
      document.querySelector('.topbar').appendChild(notice);
    }

    window.addEventListener('hashchange', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', boot);

  return {
    register: register,
    go: go,
    render: render,
    views: APP_VIEWS,
    get store() { return store; }
  };
})();
```

- [ ] **Step 6: Add a placeholder view so routing is observable**

Append to `app.js`, temporarily — Tasks 9–11 replace each of these three registrations with a real view.

```js
// Temporary: replaced by views/reference-view.js, quiz-view.js, progress-view.js.
['reference', 'quiz', 'progress'].forEach(function (name) {
  App.register(name, {
    render: function (mount, param) {
      var p = document.createElement('p');
      p.textContent = 'View: ' + name + (param ? ' / param: ' + param : '');
      mount.appendChild(p);
    }
  });
});
```

- [ ] **Step 7: Add the router script tag and notice styling**

In `index.html`, add before the other `lib/` scripts:

```html
<script src="lib/router.js"></script>
```

In `style.css`:

```css
.notice {
  margin: 0.5rem 0 0;
  padding: 0.5rem 0.65rem;
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--warn) 15%, transparent);
  color: var(--warn);
  font-size: 0.8rem;
}

.empty { color: var(--text-dim); }

/* `hidden` is ignored on an element with an explicit display, so make it win.
   The reference view relies on it to hide the lecture listing while searching. */
[hidden] { display: none !important; }
```

- [ ] **Step 8: Verify routing in the browser**

Load `http://localhost:8765/ap-exam-prep/` and check:

1. The page lands on "View: reference" and the Reference tab is highlighted.
2. Tapping Quiz shows "View: quiz" and moves the highlight.
3. Navigating to `#/reference/l2-nyquist` shows "View: reference / param: l2-nyquist".
4. Browser Back returns to the previous view.
5. Reloading on `#/quiz` lands on the quiz view, not a 404 — the reason for hash routing.
6. Navigating to `#/nonsense` falls back to reference rather than blanking.

Console must be clean throughout.

- [ ] **Step 9: Commit**

```bash
git add lib/router.js tests/router.test.js app.js index.html style.css
git commit -m "feat: hash router and app boot with view registry"
```

---

### Task 9: `views/reference-view.js`

**Files:**
- Create: `views/reference-view.js`
- Modify: `app.js` (drop the `reference` placeholder), `index.html`, `style.css`

**Interfaces:**
- Consumes: `LECTURES`, `CROSS_CUTTING`, `ContentIndex`, `Search`, `App.go`, `katex`
- Produces: `App.views.reference`. A `param` is an item id to scroll to and highlight, which is how Task 10's "View in Reference Bank" link lands.

- [ ] **Step 1: Write `views/reference-view.js`**

```js
// Reference Bank: lecture nav, collapsible sections, search, cross-cutting tab.
(function () {
  'use strict';

  var TYPE_LABELS = {
    definition: 'Definition',
    formula: 'Formula',
    distinction: 'Distinction',
    fact: 'Fact',
    pitfall: 'Watch out'
  };

  var state = { tab: 'lectures', lectureId: null, queryText: '' };
  var searchIndex = null;

  function index() {
    if (!searchIndex) searchIndex = Search.build(ContentIndex.flatten(LECTURES));
    return searchIndex;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderFormula(latex) {
    var holder = el('div', 'item-formula');
    try {
      holder.innerHTML = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true
      });
    } catch (err) {
      holder.textContent = latex;   // never leave the user with nothing
    }
    return holder;
  }

  function itemCard(item, opts) {
    var options = opts || {};
    var card = el('article', 'item item-' + item.type);
    card.id = 'item-' + item.id;

    var head = el('div', 'item-head');
    head.appendChild(el('span', 'item-type', TYPE_LABELS[item.type] || item.type));
    if (options.showLecture) {
      head.appendChild(el('span', 'item-origin', 'L' + item.lectureId));
    }
    card.appendChild(head);

    card.appendChild(el('h3', 'item-term', item.term));
    card.appendChild(el('p', 'item-body', item.body));

    if (item.formula) {
      card.appendChild(renderFormula(item.formula));
      if (item.symbols) card.appendChild(el('p', 'item-symbols', item.symbols));
    }

    if (item.crossRef && item.crossRef.length) {
      var refs = el('div', 'item-refs');
      item.crossRef.forEach(function (key) {
        var group = CROSS_CUTTING.filter(function (g) { return g.key === key; })[0];
        if (!group) return;
        var link = el('button', 'chip', 'Also: ' + group.title);
        link.type = 'button';
        link.addEventListener('click', function () {
          state.tab = 'cross';
          state.crossKey = key;
          App.go('reference', null);
        });
        refs.appendChild(link);
      });
      card.appendChild(refs);
    }

    return card;
  }

  function renderTabs(mount) {
    var tabs = el('div', 'subtabs');
    [
      { key: 'lectures', label: 'Lectures' },
      { key: 'cross', label: 'Cross-cutting' }
    ].forEach(function (tab) {
      var button = el('button', 'subtab' + (state.tab === tab.key ? ' is-active' : ''), tab.label);
      button.type = 'button';
      button.addEventListener('click', function () {
        state.tab = tab.key;
        App.render();
      });
      tabs.appendChild(button);
    });
    mount.appendChild(tabs);
  }

  function renderSearch(mount) {
    var wrap = el('div', 'searchbar');
    var input = el('input', 'search-input');
    input.type = 'search';
    input.placeholder = 'Search all lectures…';
    input.value = state.queryText;
    input.setAttribute('aria-label', 'Search the reference bank');

    var results = el('div', 'search-results');

    function update() {
      state.queryText = input.value;

      // Hide the listing rather than re-rendering: a full render would destroy
      // the input and drop the caret. May not exist yet on the first call.
      var listing = mount.querySelector('.lecture-listing');
      if (listing) listing.hidden = state.queryText.trim() !== '';

      results.innerHTML = '';
      var hits = Search.query(index(), state.queryText);

      if (!state.queryText.trim()) return;

      if (hits.length === 0) {
        results.appendChild(el('p', 'empty', 'No matches.'));
        return;
      }
      results.appendChild(
        el('p', 'search-count', hits.length + (hits.length === 1 ? ' match' : ' matches'))
      );
      hits.slice(0, 50).forEach(function (item) {
        results.appendChild(itemCard(item, { showLecture: true }));
      });
    }

    input.addEventListener('input', update);
    wrap.appendChild(input);
    mount.appendChild(wrap);
    mount.appendChild(results);
    update();

    return function isSearching() { return state.queryText.trim() !== ''; };
  }

  function renderLectureNav(mount) {
    var nav = el('nav', 'lecture-nav');
    nav.setAttribute('aria-label', 'Lectures');

    LECTURES.slice()
      .sort(function (a, b) { return a.id - b.id; })
      .forEach(function (lecture) {
        var active = state.lectureId === lecture.id;
        var button = el('button', 'lecture-pill' + (active ? ' is-active' : ''));
        button.type = 'button';
        button.appendChild(el('span', 'lecture-pill-num', 'L' + lecture.id));
        button.appendChild(el('span', 'lecture-pill-name', lecture.shortName));
        button.addEventListener('click', function () {
          state.lectureId = active ? null : lecture.id;
          App.render();
        });
        nav.appendChild(button);
      });

    mount.appendChild(nav);
  }

  function renderLecture(mount, lecture, openItemId) {
    mount.appendChild(el('h2', 'lecture-title', lecture.name));

    lecture.sections.forEach(function (section, sectionIndex) {
      var details = el('details', 'section');
      var containsTarget = openItemId && section.items.some(function (item) {
        return item.id === openItemId;
      });
      // First section open by default so the page is never a wall of closed rows.
      details.open = containsTarget || sectionIndex === 0;

      var summary = el('summary', 'section-summary');
      summary.appendChild(el('span', 'section-heading', section.heading));
      summary.appendChild(el('span', 'section-count', String(section.items.length)));
      details.appendChild(summary);

      section.items.forEach(function (item) {
        details.appendChild(itemCard(item, {}));
      });

      mount.appendChild(details);
    });
  }

  function renderCrossCutting(mount) {
    CROSS_CUTTING.forEach(function (group) {
      var section = el('section', 'cross-group');
      section.id = 'group-' + group.key;
      section.appendChild(el('h2', 'cross-title', group.title));
      section.appendChild(el('p', 'cross-blurb', group.blurb));

      var items = ContentIndex.byCrossRef(LECTURES, group.key);
      if (items.length === 0) {
        section.appendChild(el('p', 'empty', 'No items yet.'));
      } else {
        ContentIndex.groupByLecture(items).forEach(function (bucket) {
          section.appendChild(
            el('h3', 'cross-lecture', 'Lecture ' + bucket.lectureId + ' — ' + bucket.lectureShortName)
          );
          bucket.items.forEach(function (item) {
            section.appendChild(itemCard(item, {}));
          });
        });
      }
      mount.appendChild(section);
    });
  }

  function highlight(itemId) {
    var target = document.getElementById('item-' + itemId);
    if (!target) return;
    target.classList.add('is-target');
    target.scrollIntoView({ block: 'center' });
  }

  function render(mount, param) {
    // A deep link always lands on the lectures tab, showing that item's lecture.
    if (param) {
      var item = ContentIndex.byId(LECTURES).get(param);
      if (item) {
        state.tab = 'lectures';
        state.lectureId = item.lectureId;
        state.queryText = '';
      }
    }

    renderTabs(mount);

    if (state.tab === 'cross') {
      renderCrossCutting(mount);
      if (state.crossKey) {
        var group = document.getElementById('group-' + state.crossKey);
        if (group) group.scrollIntoView({ block: 'start' });
        state.crossKey = null;
      }
      return;
    }

    var isSearching = renderSearch(mount);

    // Built unconditionally so that clearing the search has something to
    // restore; typing toggles `hidden` and never re-renders, which is what
    // keeps the search input's focus and caret.
    var listing = el('div', 'lecture-listing');
    mount.appendChild(listing);
    listing.hidden = isSearching();

    renderLectureNav(listing);

    var lectures = LECTURES.slice().sort(function (a, b) { return a.id - b.id; });
    if (state.lectureId == null) {
      if (lectures.length === 0) {
        listing.appendChild(el('p', 'empty', 'No content loaded.'));
        return;
      }
      state.lectureId = lectures[0].id;
    }

    var current = lectures.filter(function (l) { return l.id === state.lectureId; })[0];
    if (!current) {
      listing.appendChild(el('p', 'empty', 'That lecture is not loaded.'));
      return;
    }

    renderLecture(listing, current, param);
    if (param) highlight(param);
  }

  App.register('reference', { render: render });
})();
```

- [ ] **Step 2: Remove `reference` from the placeholder registration in `app.js`**

Change the temporary block to cover only the two views that are still placeholders:

```js
// Temporary: replaced by views/quiz-view.js and views/progress-view.js.
['quiz', 'progress'].forEach(function (name) {
  App.register(name, {
    render: function (mount, param) {
      var p = document.createElement('p');
      p.textContent = 'View: ' + name + (param ? ' / param: ' + param : '');
      mount.appendChild(p);
    }
  });
});
```

View files load after `app.js` and call `App.register` at evaluation time; `app.js` only reads the registry on `DOMContentLoaded`, by which point all three have registered.

- [ ] **Step 3: Update the script order in `index.html`**

```html
<script src="lib/router.js"></script>
<script src="lib/content-index.js"></script>
<script src="lib/search.js"></script>
<script src="lib/quiz-engine.js"></script>
<script src="lib/progress-store.js"></script>
<script src="app.js"></script>
<script src="views/reference-view.js"></script>
```

- [ ] **Step 4: Add the Reference Bank styles to `style.css`**

```css
.subtabs { display: flex; gap: 0.5rem; margin-bottom: 0.85rem; }

.subtab {
  flex: 1;
  min-height: 2.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text-dim);
  font: inherit;
  font-size: 0.9rem;
}

.subtab.is-active {
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}

.search-input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  font-size: 1rem;           /* 16px minimum: anything less makes iOS zoom on focus */
}

.search-count { margin: 0.75rem 0 0.25rem; font-size: 0.8rem; color: var(--text-dim); }

.lecture-nav {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding: 0.85rem 0;
  scrollbar-width: none;
}

.lecture-nav::-webkit-scrollbar { display: none; }

.lecture-pill {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  min-height: 2.75rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  text-align: left;
}

.lecture-pill.is-active { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, var(--surface)); }
.lecture-pill-num { font-size: 0.7rem; color: var(--text-dim); }
.lecture-pill-name { font-size: 0.85rem; white-space: nowrap; }

.lecture-title { font-size: 1.15rem; margin: 0.5rem 0 0.75rem; }

.section { border: 1px solid var(--border); border-radius: 0.5rem; margin-bottom: 0.6rem; }

.section-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
}

.section-count { font-size: 0.75rem; font-weight: 400; color: var(--text-dim); }

.item {
  padding: 0.75rem;
  border-top: 1px solid var(--border);
}

.item-head { display: flex; gap: 0.5rem; align-items: center; }

.item-type {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-dim);
}

.item-origin { font-size: 0.7rem; color: var(--accent); }
.item-term { margin: 0.25rem 0 0.35rem; font-size: 1rem; }
.item-body { margin: 0; }
.item-symbols { margin: 0.35rem 0 0; font-size: 0.85rem; color: var(--text-dim); }
.item-formula { overflow-x: auto; margin: 0.5rem 0; }

.item-pitfall {
  background: color-mix(in srgb, var(--warn) 10%, transparent);
  border-left: 3px solid var(--warn);
}

.item-pitfall .item-type { color: var(--warn); font-weight: 700; }

.item-refs { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem; }

.chip {
  min-height: 2rem;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 0.75rem;
}

.is-target {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 0.4rem;
}

.cross-group { margin-bottom: 1.5rem; }
.cross-title { font-size: 1.05rem; margin: 0 0 0.35rem; }
.cross-blurb { margin: 0 0 0.75rem; color: var(--text-dim); font-size: 0.9rem; }
.cross-lecture { font-size: 0.8rem; margin: 0.9rem 0 0.35rem; color: var(--accent); }
```

- [ ] **Step 5: Verify in the browser**

With only Lecture 2 loaded, at `http://localhost:8765/ap-exam-prep/#/reference`:

1. The Lectures subtab is active and the L2 pill is selected.
2. Section headings are collapsible; the first is open, the rest closed.
3. Formula items show KaTeX-rendered maths with the symbols line beneath, and no raw LaTeX appears anywhere.
4. Pitfall items are visually distinct from the rest.
5. Typing `aliasing` in the search box replaces the lecture listing with ranked matches, each labelled with its lecture; clearing it restores the listing.
6. Searching a nonsense string shows "No matches."
7. The Cross-cutting subtab lists all four groups with their blurbs, items grouped by lecture, and "No items yet." under the three groups L2 does not populate.
8. Tapping an "Also:" chip on an L2 item switches to the Cross-cutting tab and scrolls to that group.
9. Loading `#/reference/l2-nyquist` directly opens L2 with the containing section expanded and that card outlined.

Console clean; no KaTeX font 404s.

- [ ] **Step 6: Commit**

```bash
git add views/reference-view.js app.js index.html style.css
git commit -m "feat: reference bank view with search and cross-cutting tab"
```

---

### Task 10: `views/quiz-view.js`

**Files:**
- Create: `views/quiz-view.js`
- Modify: `app.js` (drop `quiz` from the placeholder list), `index.html`, `style.css`

**Interfaces:**
- Consumes: `QUESTIONS`, `LECTURES`, `QuizEngine`, `App.store`, `App.go`
- Produces: `App.views.quiz`

The view holds three screens in one module — setup, question, summary — because they share one session object and splitting them would mean passing that session across file boundaries for no gain.

- [ ] **Step 1: Write `views/quiz-view.js`**

```js
// Quiz: scope and mode setup, question flow, summary, retry-missed.
(function () {
  'use strict';

  var state = {
    screen: 'setup',       // 'setup' | 'question' | 'summary'
    scope: { lectures: 'all', mode: 'mixed' },
    selected: {},          // lectureId -> true, used only while on setup
    session: null,
    revealed: false,
    picked: null,
    lastSummary: null
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function button(className, text, onClick) {
    var node = el('button', className, text);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  }

  function sortedLectures() {
    return LECTURES.slice().sort(function (a, b) { return a.id - b.id; });
  }

  function selectedIds() {
    return Object.keys(state.selected)
      .filter(function (id) { return state.selected[id]; })
      .map(Number)
      .sort(function (a, b) { return a - b; });
  }

  function countAvailable(lectures, mode) {
    return QuizEngine.build(QUESTIONS, { lectures: lectures, mode: mode, rng: function () { return 0; } }).length;
  }

  // ---- setup screen -------------------------------------------------------

  function renderSetup(mount) {
    mount.appendChild(el('h2', 'screen-title', 'Start a quiz'));

    mount.appendChild(el('h3', 'field-label', 'Lectures'));
    var picker = el('div', 'chip-grid');

    var allSelected = selectedIds().length === 0;
    picker.appendChild(
      button('chip-lg' + (allSelected ? ' is-on' : ''), 'All', function () {
        state.selected = {};
        App.render();
      })
    );

    sortedLectures().forEach(function (lecture) {
      var on = !!state.selected[lecture.id];
      picker.appendChild(
        button('chip-lg' + (on ? ' is-on' : ''), 'L' + lecture.id, function () {
          state.selected[lecture.id] = !on;
          App.render();
        })
      );
    });
    mount.appendChild(picker);

    mount.appendChild(el('h3', 'field-label', 'Mode'));
    var modes = el('div', 'chip-grid');
    [
      { key: 'mixed', label: 'Mixed' },
      { key: 'mc', label: 'Multiple choice' },
      { key: 'short', label: 'Short answer' }
    ].forEach(function (mode) {
      var on = state.scope.mode === mode.key;
      modes.appendChild(
        button('chip-lg' + (on ? ' is-on' : ''), mode.label, function () {
          state.scope.mode = mode.key;
          App.render();
        })
      );
    });
    mount.appendChild(modes);

    var ids = selectedIds();
    var scopeValue = ids.length === 0 ? 'all' : ids;
    var available = countAvailable(scopeValue, state.scope.mode);

    mount.appendChild(
      el('p', 'field-note', available + (available === 1 ? ' question' : ' questions') + ' in this scope')
    );

    var start = button('btn btn-primary', 'Start quiz', function () {
      var set = QuizEngine.build(QUESTIONS, {
        lectures: scopeValue,
        mode: state.scope.mode
      });
      state.scope.lectures = scopeValue;
      state.session = QuizEngine.create(set);
      state.screen = 'question';
      state.revealed = false;
      state.picked = null;
      App.render();
    });
    start.disabled = available === 0;
    mount.appendChild(start);

    if (available === 0) {
      mount.appendChild(
        el('p', 'empty', 'No questions match that combination. Try a different mode or more lectures.')
      );
    }
  }

  // ---- question screen ----------------------------------------------------

  function renderProgressBar(mount, session) {
    var bar = el('div', 'qbar');
    var fill = el('div', 'qbar-fill');
    fill.style.width = (session.position() / session.total * 100) + '%';
    bar.appendChild(fill);
    mount.appendChild(bar);
    mount.appendChild(
      el('p', 'qcount', 'Question ' + (session.position() + 1) + ' of ' + session.total)
    );
  }

  function renderRefLink(mount, question) {
    mount.appendChild(
      button('btn btn-link', 'View in Reference Bank', function () {
        App.go('reference', question.contentRef);
      })
    );
  }

  function advance() {
    state.revealed = false;
    state.picked = null;
    if (state.session.isDone()) {
      state.lastSummary = state.session.summary();
      App.store.addAttempt(state.lastSummary, state.scope);
      state.screen = 'summary';
    }
    App.render();
  }

  function renderMultipleChoice(mount, question) {
    var list = el('div', 'options');

    question.options.forEach(function (option, optionIndex) {
      var classes = 'option';
      if (state.revealed) {
        if (optionIndex === question.correctIndex) classes += ' is-correct';
        else if (optionIndex === state.picked) classes += ' is-wrong';
      }

      var node = button(classes, option, function () {
        if (state.revealed) return;
        state.picked = optionIndex;
        state.revealed = true;
        App.render();
      });
      node.disabled = state.revealed;
      list.appendChild(node);
    });

    mount.appendChild(list);

    if (!state.revealed) return;

    var right = state.picked === question.correctIndex;
    mount.appendChild(el('p', 'verdict ' + (right ? 'is-ok' : 'is-bad'), right ? 'Correct' : 'Incorrect'));
    mount.appendChild(el('p', 'model-answer', question.answer));
    renderRefLink(mount, question);

    mount.appendChild(button('btn btn-primary', 'Next', function () {
      state.session.record(right);
      advance();
    }));
  }

  function renderShortAnswer(mount, question) {
    var box = el('textarea', 'answer-box');
    box.rows = 4;
    box.placeholder = 'Write your answer, or just think it through…';
    box.setAttribute('aria-label', 'Your answer');
    mount.appendChild(box);

    if (!state.revealed) {
      mount.appendChild(button('btn btn-primary', 'Reveal model answer', function () {
        state.revealed = true;
        App.render();
      }));
      return;
    }

    mount.appendChild(el('h3', 'field-label', 'Model answer'));
    mount.appendChild(el('p', 'model-answer', question.answer));
    renderRefLink(mount, question);

    mount.appendChild(el('p', 'field-label', 'How did you do?'));
    var marks = el('div', 'mark-row');
    marks.appendChild(button('btn btn-ok', 'I was right', function () {
      state.session.record(true);
      advance();
    }));
    marks.appendChild(button('btn btn-bad', 'I was wrong', function () {
      state.session.record(false);
      advance();
    }));
    mount.appendChild(marks);
  }

  function renderQuestion(mount) {
    var session = state.session;
    var question = session.current();

    if (!question) { advance(); return; }

    renderProgressBar(mount, session);
    mount.appendChild(el('p', 'qmeta', 'Lecture ' + question.lecture + ' · ' + question.topic));
    mount.appendChild(el('h2', 'qtext', question.question));

    if (question.mode === 'mc') renderMultipleChoice(mount, question);
    else renderShortAnswer(mount, question);

    mount.appendChild(button('btn btn-quiet', 'End quiz', function () {
      state.lastSummary = session.summary();
      if (state.lastSummary.total > 0) {
        App.store.addAttempt(state.lastSummary, state.scope);
      }
      state.screen = 'summary';
      App.render();
    }));
  }

  // ---- summary screen -----------------------------------------------------

  function renderBreakdown(mount, title, buckets, labelFor) {
    var keys = Object.keys(buckets);
    if (keys.length === 0) return;

    mount.appendChild(el('h3', 'field-label', title));
    var table = el('div', 'breakdown');

    keys.sort(function (a, b) {
      var aPct = buckets[a].correct / buckets[a].total;
      var bPct = buckets[b].correct / buckets[b].total;
      return aPct - bPct;   // weakest first: that is what to study next
    }).forEach(function (key) {
      var bucket = buckets[key];
      var pct = Math.round(bucket.correct / bucket.total * 100);

      var row = el('div', 'breakdown-row');
      row.appendChild(el('span', 'breakdown-label', labelFor(key)));

      var track = el('span', 'breakdown-track');
      var fill = el('span', 'breakdown-fill');
      fill.style.width = pct + '%';
      if (pct < 50) fill.classList.add('is-bad');
      else if (pct < 80) fill.classList.add('is-mid');
      track.appendChild(fill);
      row.appendChild(track);

      row.appendChild(
        el('span', 'breakdown-num', bucket.correct + '/' + bucket.total)
      );
      table.appendChild(row);
    });

    mount.appendChild(table);
  }

  function lectureLabel(id) {
    var lecture = LECTURES.filter(function (l) { return String(l.id) === String(id); })[0];
    return lecture ? 'L' + lecture.id + ' ' + lecture.shortName : 'L' + id;
  }

  function renderSummary(mount) {
    var summary = state.lastSummary;
    var pct = summary.total === 0 ? 0 : Math.round(summary.correct / summary.total * 100);

    mount.appendChild(el('h2', 'screen-title', 'Quiz complete'));
    mount.appendChild(el('p', 'big-score', summary.correct + ' / ' + summary.total));
    mount.appendChild(el('p', 'field-note', pct + '% correct'));

    renderBreakdown(mount, 'By lecture', summary.byLecture, lectureLabel);
    renderBreakdown(mount, 'By topic', summary.byTopic, function (key) { return key; });

    if (summary.missed.length > 0) {
      mount.appendChild(el('h3', 'field-label', 'Missed questions'));
      var list = el('div', 'missed-list');
      summary.missed.forEach(function (question) {
        var row = el('div', 'missed-row');
        row.appendChild(el('p', 'missed-q', question.question));
        row.appendChild(button('btn btn-link', 'View in Reference Bank', function () {
          App.go('reference', question.contentRef);
        }));
        list.appendChild(row);
      });
      mount.appendChild(list);

      mount.appendChild(button('btn btn-primary', 'Retry missed questions', function () {
        state.session = QuizEngine.create(summary.missed.slice());
        state.screen = 'question';
        state.revealed = false;
        state.picked = null;
        App.render();
      }));
    } else if (summary.total > 0) {
      mount.appendChild(el('p', 'verdict is-ok', 'Nothing missed.'));
    }

    mount.appendChild(button('btn btn-quiet', 'New quiz', function () {
      state.screen = 'setup';
      state.session = null;
      App.render();
    }));
  }

  function render(mount) {
    if (state.screen === 'question' && state.session) renderQuestion(mount);
    else if (state.screen === 'summary' && state.lastSummary) renderSummary(mount);
    else { state.screen = 'setup'; renderSetup(mount); }
  }

  App.register('quiz', { render: render });
})();
```

A retry session is *not* recorded as a new attempt until it finishes, at which point `advance()` stores it like any other — so a retry counts toward topic accuracy, which is correct: re-answering a question you got wrong is evidence about that topic.

- [ ] **Step 2: Drop `quiz` from the placeholder registration in `app.js`**

```js
// Temporary: replaced by views/progress-view.js.
['progress'].forEach(function (name) {
  App.register(name, {
    render: function (mount, param) {
      var p = document.createElement('p');
      p.textContent = 'View: ' + name + (param ? ' / param: ' + param : '');
      mount.appendChild(p);
    }
  });
});
```

- [ ] **Step 3: Add the script tag to `index.html`**

```html
<script src="views/quiz-view.js"></script>
```

- [ ] **Step 4: Add the quiz styles to `style.css`**

```css
.screen-title { font-size: 1.15rem; margin: 0 0 0.75rem; }
.field-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-dim); margin: 1rem 0 0.4rem; }
.field-note { margin: 0.5rem 0; font-size: 0.85rem; color: var(--text-dim); }

.chip-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.chip-lg {
  min-height: 2.75rem;
  min-width: 3.25rem;
  padding: 0 0.8rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 0.9rem;
}

.chip-lg.is-on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 15%, var(--surface));
  color: var(--accent);
  font-weight: 600;
}

.btn {
  display: block;
  width: 100%;
  min-height: 3rem;
  margin-top: 0.6rem;
  padding: 0 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 1rem;
}

.btn:disabled { opacity: 0.5; }
.btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
.btn-ok { background: var(--ok); border-color: var(--ok); color: #fff; }
.btn-bad { background: var(--bad); border-color: var(--bad); color: #fff; }
.btn-quiet { background: transparent; color: var(--text-dim); }
.btn-link { background: transparent; border: none; color: var(--accent); text-align: left; min-height: 2.75rem; padding: 0; }

.mark-row { display: flex; gap: 0.5rem; }
.mark-row .btn { margin-top: 0; }

.qbar { height: 0.25rem; border-radius: 999px; background: var(--surface); overflow: hidden; }
.qbar-fill { height: 100%; background: var(--accent); transition: width 0.2s; }
.qcount { margin: 0.4rem 0 0; font-size: 0.75rem; color: var(--text-dim); }
.qmeta { margin: 0.75rem 0 0.25rem; font-size: 0.75rem; color: var(--accent); }
.qtext { font-size: 1.05rem; line-height: 1.45; margin: 0 0 1rem; }

.options { display: flex; flex-direction: column; gap: 0.5rem; }

.option {
  min-height: 3rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 0.95rem;
  text-align: left;
  line-height: 1.4;
}

.option:disabled { opacity: 1; }   /* keep revealed options fully readable */
.option.is-correct { border-color: var(--ok); background: color-mix(in srgb, var(--ok) 18%, var(--surface)); }
.option.is-wrong { border-color: var(--bad); background: color-mix(in srgb, var(--bad) 18%, var(--surface)); }

.verdict { margin: 0.85rem 0 0.35rem; font-weight: 700; }
.verdict.is-ok { color: var(--ok); }
.verdict.is-bad { color: var(--bad); }

.model-answer {
  margin: 0.35rem 0 0;
  padding: 0.7rem 0.85rem;
  border-left: 3px solid var(--accent);
  background: var(--surface);
  border-radius: 0 0.4rem 0.4rem 0;
}

.answer-box {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  font-size: 1rem;      /* 16px minimum, or iOS zooms on focus */
  resize: vertical;
}

.big-score { font-size: 2.25rem; font-weight: 700; margin: 0.5rem 0 0; }

.breakdown { display: flex; flex-direction: column; gap: 0.4rem; }
.breakdown-row { display: grid; grid-template-columns: 5.5rem 1fr 2.75rem; gap: 0.5rem; align-items: center; }
.breakdown-label { font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.breakdown-track { height: 0.5rem; border-radius: 999px; background: var(--surface); overflow: hidden; }
.breakdown-fill { display: block; height: 100%; background: var(--ok); }
.breakdown-fill.is-mid { background: var(--warn); }
.breakdown-fill.is-bad { background: var(--bad); }
.breakdown-num { font-size: 0.75rem; color: var(--text-dim); text-align: right; }

.missed-list { display: flex; flex-direction: column; gap: 0.5rem; }
.missed-row { padding: 0.6rem 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; }
.missed-q { margin: 0; font-size: 0.9rem; }
```

- [ ] **Step 5: Walk a full quiz in the browser**

At `http://localhost:8765/ap-exam-prep/#/quiz`, with only L2 loaded:

1. Setup shows an All chip plus one per loaded lecture, three mode chips, and a live question count.
2. Selecting Short answer changes the count; selecting a mode with no questions disables Start and shows the explanation.
3. Start begins the quiz; the progress bar and "Question 1 of N" appear.
4. On an MC question, tapping an option immediately marks the correct one green and, if wrong, the picked one red, shows a verdict and the explanation, and disables further picking.
5. On a short question, Reveal shows the model answer and the two self-mark buttons; no self-mark is possible before revealing.
6. "View in Reference Bank" jumps to the Reference tab with the linked card outlined.
7. Completing every question shows the summary with score, by-lecture and by-topic breakdowns sorted weakest-first, and the missed list.
8. "Retry missed questions" starts a session containing exactly the missed ones.
9. "End quiz" partway through goes straight to a summary for the questions answered so far.

Then confirm the attempt was stored, by evaluating in the page:

```js
JSON.parse(localStorage.getItem('ap-exam-prep/progress/v1')).attempts.length
```

Expected: a number that grows by one per completed quiz.

- [ ] **Step 6: Commit**

```bash
git add views/quiz-view.js app.js index.html style.css
git commit -m "feat: quiz view with mc, short answer, summary and retry-missed"
```

---

### Task 11: `views/progress-view.js`

**Files:**
- Create: `views/progress-view.js`
- Modify: `app.js` (remove the placeholder block entirely), `index.html`, `style.css`

**Interfaces:**
- Consumes: `App.store` (Task 7), `LECTURES`
- Produces: `App.views.progress`

- [ ] **Step 1: Write `views/progress-view.js`**

```js
// Progress: attempt trend, running accuracy, reset, export and import.
(function () {
  'use strict';

  var flash = null;   // {kind: 'ok'|'bad', text: string}, shown once after an action

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function button(className, text, onClick) {
    var node = el('button', className, text);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  }

  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) +
      ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function scopeLabel(scope) {
    if (!scope) return '';
    var lectures = scope.lectures === 'all' || !scope.lectures.length
      ? 'All'
      : scope.lectures.map(function (id) { return 'L' + id; }).join(' ');
    return lectures + ' · ' + (scope.mode || 'mixed');
  }

  function renderFlash(mount) {
    if (!flash) return;
    mount.appendChild(el('p', 'flash is-' + flash.kind, flash.text));
    flash = null;
  }

  function renderTrend(mount, attempts) {
    mount.appendChild(el('h3', 'field-label', 'Attempts'));

    if (attempts.length === 0) {
      mount.appendChild(el('p', 'empty', 'No attempts yet. Take a quiz and it will show up here.'));
      return;
    }

    var list = el('div', 'trend');
    attempts.slice().reverse().forEach(function (attempt) {
      var pct = attempt.total === 0 ? 0 : Math.round(attempt.correct / attempt.total * 100);

      var row = el('div', 'trend-row');
      var meta = el('div', 'trend-meta');
      meta.appendChild(el('span', 'trend-date', formatDate(attempt.at)));
      meta.appendChild(el('span', 'trend-scope', scopeLabel(attempt.scope)));
      row.appendChild(meta);

      var track = el('span', 'breakdown-track');
      var fill = el('span', 'breakdown-fill');
      fill.style.width = pct + '%';
      if (pct < 50) fill.classList.add('is-bad');
      else if (pct < 80) fill.classList.add('is-mid');
      track.appendChild(fill);
      row.appendChild(track);

      row.appendChild(el('span', 'breakdown-num', attempt.correct + '/' + attempt.total));
      list.appendChild(row);
    });
    mount.appendChild(list);
  }

  function renderAccuracy(mount, title, buckets, labelFor, emptyText) {
    mount.appendChild(el('h3', 'field-label', title));

    var keys = Object.keys(buckets);
    if (keys.length === 0) {
      mount.appendChild(el('p', 'empty', emptyText));
      return;
    }

    var table = el('div', 'breakdown');
    keys.sort(function (a, b) {
      return (buckets[a].correct / buckets[a].total) - (buckets[b].correct / buckets[b].total);
    }).forEach(function (key) {
      var bucket = buckets[key];
      var pct = Math.round(bucket.correct / bucket.total * 100);

      var row = el('div', 'breakdown-row');
      row.appendChild(el('span', 'breakdown-label', labelFor(key)));

      var track = el('span', 'breakdown-track');
      var fill = el('span', 'breakdown-fill');
      fill.style.width = pct + '%';
      if (pct < 50) fill.classList.add('is-bad');
      else if (pct < 80) fill.classList.add('is-mid');
      track.appendChild(fill);
      row.appendChild(track);

      row.appendChild(el('span', 'breakdown-num', bucket.correct + '/' + bucket.total));
      table.appendChild(row);
    });
    mount.appendChild(table);
  }

  function download(text, filename) {
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke on the next tick; revoking synchronously can cancel the download.
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function renderActions(mount) {
    mount.appendChild(el('h3', 'field-label', 'Move progress between devices'));
    mount.appendChild(
      el('p', 'field-note', 'Progress lives in this browser only. Export here, import on the other device.')
    );

    mount.appendChild(button('btn', 'Export progress', function () {
      var stamp = new Date().toISOString().slice(0, 10);
      download(App.store.exportJSON(), 'ap-exam-prep-progress-' + stamp + '.json');
    }));

    var picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'application/json,.json';
    picker.className = 'visually-hidden';
    picker.addEventListener('change', function () {
      var file = picker.files && picker.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function () {
        try {
          var result = App.store.importJSON(String(reader.result));
          flash = {
            kind: 'ok',
            text: 'Imported ' + result.added +
              (result.added === 1 ? ' attempt' : ' attempts') +
              (result.skipped ? ', skipped ' + result.skipped + ' already present' : '') + '.'
          };
        } catch (err) {
          flash = { kind: 'bad', text: err.message };
        }
        picker.value = '';   // so re-picking the same file fires change again
        App.render();
      };
      reader.onerror = function () {
        flash = { kind: 'bad', text: 'That file could not be read.' };
        picker.value = '';
        App.render();
      };
      reader.readAsText(file);
    });
    mount.appendChild(picker);

    mount.appendChild(button('btn', 'Import progress', function () { picker.click(); }));

    mount.appendChild(el('h3', 'field-label', 'Danger zone'));
    mount.appendChild(button('btn btn-bad', 'Reset all progress', function () {
      var ok = window.confirm(
        'Delete every recorded attempt in this browser? This cannot be undone. ' +
        'Export first if you want to keep it.'
      );
      if (!ok) return;
      App.store.reset();
      flash = { kind: 'ok', text: 'Progress cleared.' };
      App.render();
    }));
  }

  function lectureLabel(id) {
    var lecture = LECTURES.filter(function (l) { return String(l.id) === String(id); })[0];
    return lecture ? 'L' + lecture.id + ' ' + lecture.shortName : 'L' + id;
  }

  function render(mount) {
    mount.appendChild(el('h2', 'screen-title', 'Progress'));
    renderFlash(mount);

    if (!App.store.isPersistent()) {
      mount.appendChild(
        el('p', 'notice', 'Storage is unavailable in this browser, so nothing here will survive a reload.')
      );
    }

    var attempts = App.store.attempts();

    if (attempts.length > 0) {
      var totalQuestions = 0;
      var totalCorrect = 0;
      attempts.forEach(function (attempt) {
        totalQuestions += attempt.total;
        totalCorrect += attempt.correct;
      });
      mount.appendChild(el('p', 'big-score', totalCorrect + ' / ' + totalQuestions));
      mount.appendChild(
        el('p', 'field-note', attempts.length + (attempts.length === 1 ? ' attempt' : ' attempts') + ' recorded')
      );
    }

    renderAccuracy(
      mount, 'Accuracy by topic', App.store.topicAccuracy(),
      function (key) { return key; },
      'Take a quiz to build a topic breakdown — this is the list that tells you what to study next.'
    );
    renderAccuracy(
      mount, 'Accuracy by lecture', App.store.lectureAccuracy(), lectureLabel,
      'No lecture data yet.'
    );
    renderTrend(mount, attempts);
    renderActions(mount);
  }

  App.register('progress', { render: render });
})();
```

- [ ] **Step 2: Remove the placeholder block from `app.js` entirely**

All three views are now real. Delete the temporary `['progress'].forEach(...)` registration.

- [ ] **Step 3: Add the script tag to `index.html`**

```html
<script src="views/progress-view.js"></script>
```

- [ ] **Step 4: Add the progress styles to `style.css`**

```css
.flash { margin: 0 0 0.75rem; padding: 0.6rem 0.75rem; border-radius: 0.4rem; font-size: 0.85rem; }
.flash.is-ok { background: color-mix(in srgb, var(--ok) 15%, transparent); color: var(--ok); }
.flash.is-bad { background: color-mix(in srgb, var(--bad) 15%, transparent); color: var(--bad); }

.trend { display: flex; flex-direction: column; gap: 0.5rem; }
.trend-row { display: grid; grid-template-columns: 8.5rem 1fr 2.75rem; gap: 0.5rem; align-items: center; }
.trend-meta { display: flex; flex-direction: column; overflow: hidden; }
.trend-date { font-size: 0.8rem; white-space: nowrap; }
.trend-scope { font-size: 0.7rem; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  margin: -1px; padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 5: Verify in the browser**

At `http://localhost:8765/ap-exam-prep/#/progress`:

1. With no attempts, the empty states explain what to do rather than showing blank sections.
2. After completing a quiz, the totals, topic accuracy, lecture accuracy and attempt list all populate, with weakest topics first.
3. Export downloads `ap-exam-prep-progress-YYYY-MM-DD.json`; opening it shows `version`, `exportedAt` and the attempts.
4. Import of that same file reports `Imported 0 attempts, skipped N already present.` — proving dedup.
5. Reset prompts for confirmation; cancelling leaves the data; confirming clears it and the empty states return.
6. Import of the previously exported file after a reset restores every attempt.
7. Importing a non-JSON file shows the error message in red and changes nothing.

- [ ] **Step 6: Commit**

```bash
git add views/progress-view.js app.js index.html style.css
git commit -m "feat: progress view with trend, topic accuracy and json export/import"
```

---

### Task 12: Responsive and dark-mode pass

**Files:**
- Modify: `style.css`

**Interfaces:**
- Consumes: every class introduced in Tasks 8–11
- Produces: no new API; a layout that works from 320px to desktop in both colour schemes

- [ ] **Step 1: Add the desktop layout and shared polish**

Append to `style.css`. Everything above this point is the phone layout; this widens it.

```css
/* Tap targets and text selection behaviour that only matter on touch. */
button, summary, .tab { -webkit-tap-highlight-color: transparent; }
button { cursor: pointer; }
summary::-webkit-details-marker { display: none; }

/* Long formulas and terms must never force the page to scroll sideways.
   `clip` rather than `hidden`: `hidden` establishes a scroll container, which
   silently breaks `position: sticky` on the header and tab bar. */
body { overflow-x: clip; }
.item-term, .qtext, .model-answer, .missed-q { overflow-wrap: anywhere; }

@media (min-width: 48rem) {
  body { padding-bottom: 0; }

  /* Header and tab bar stick as ONE unit. Making them individually sticky with
     top: 0 anchors both to the same offset, so they occupy the same band and
     the header's z-index paints over the tab bar, which then vanishes on
     scroll. Sticking the wrapper keeps them stacked in normal flow. */
  .appbar {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--bg);
  }

  .topbar {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  .main { max-width: 52rem; margin: 0 auto; padding: 1.5rem 1.5rem 4rem; }

  /* The bottom tab bar becomes a top-aligned row on wide screens, back in
     normal flow inside .appbar. A sticky ancestor does not create a containing
     block for a fixed descendant, so the phone layout's bottom pinning is
     unaffected by the wrapper. */
  .tabbar {
    position: static;
    height: auto;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-top: none;
    border-bottom: 1px solid var(--border);
  }

  .tab { flex: 0 0 auto; padding: 0.5rem 1.25rem; border-radius: 0.5rem; }
  .tab[aria-current="page"] { background: color-mix(in srgb, var(--accent) 12%, transparent); }

  .btn { width: auto; min-width: 12rem; }
  .mark-row .btn { min-width: 0; flex: 1; }
  .breakdown-row { grid-template-columns: 10rem 1fr 3.5rem; }
  .trend-row { grid-template-columns: 12rem 1fr 3.5rem; }
}

@media (min-width: 64rem) {
  .main { max-width: 60rem; }
}

/* Respect a reduced-motion preference. */
@media (prefers-reduced-motion: reduce) {
  .qbar-fill { transition: none; }
  * { scroll-behavior: auto !important; }
}
```

This depends on the nav preceding `<main>` in the source, which the Task 1 markup does not do — it puts the nav last. Step 2 moves it. Source order then reads header → nav → main, which is both what the desktop rule needs and the better reading order for a screen reader; the mobile layout still pins it to the bottom via `position: fixed`.

- [ ] **Step 2: Move the nav element in `index.html`**

```html
<div class="appbar">
  <header class="topbar">
    <h1 class="topbar-title">AP Exam Prep</h1>
    <p class="topbar-sub">FAU 92402 &middot; Applied Programming</p>
  </header>

  <nav class="tabbar" aria-label="Main">
    <a class="tab" data-view="reference" href="#/reference">Reference</a>
    <a class="tab" data-view="quiz" href="#/quiz">Quiz</a>
    <a class="tab" data-view="progress" href="#/progress">Progress</a>
  </nav>
</div>

<main id="main" class="main"></main>
```

The wrapper is what the desktop rule sticks. `.appbar` is unstyled at phone width, where `.tabbar` stays `position: fixed` at the bottom.

- [ ] **Step 3: Verify at phone width**

Resize the browser to the mobile preset (375×812) and reload, then check every view:

1. No horizontal page scroll anywhere, including on the longest formula in L2 — the formula itself may scroll inside `.item-formula`, the page may not.
2. The tab bar is pinned to the bottom and clear of the home indicator.
3. Every button, option, chip and section header is at least 44px tall.
4. Focusing the search box and the short-answer textarea does not zoom the page.
5. Body text is readable without pinching.
6. The lecture pill row scrolls horizontally without a visible scrollbar.

- [ ] **Step 4: Verify at desktop width**

Reset to the desktop preset:

1. Content is centred and capped in width rather than spanning the full window.
2. The tab bar sits under the header as a row, not pinned to the bottom.
3. Buttons are their natural width, not full-bleed.
4. Nothing relies on hover to be discoverable.

- [ ] **Step 5: Verify both colour schemes**

Emulate `prefers-color-scheme: dark`, then `light`, and confirm on each: text contrast is comfortable, KaTeX formulas are legible (KaTeX inherits `color`, so they follow the token), pitfall and correct/incorrect states remain distinguishable, and no element keeps a hard-coded white or black background.

- [ ] **Step 6: Reset the viewport and commit**

Reset the browser viewport to the desktop preset so the pane is not left emulating a phone.

```bash
git add style.css index.html
git commit -m "feat: responsive layout and dark-mode pass"
```

---

### Task 13: PWA manifest and service worker

**Files:**
- Create: `manifest.json`, `sw.js`, `icons/icon-192.png`, `icons/icon-512.png`, `tools/make-icons.py`, `tools/build-precache.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: the full file list from Tasks 1–12
- Produces: an installable app that loads with the network disabled

Do this task *before* the bulk content authoring, so the precache list is generated rather than hand-written, and adding chapters in Task 14 only requires re-running the generator.

- [ ] **Step 1: Generate the icons**

```python
#!/usr/bin/env python3
"""Generate the two PWA icons. Run once; the PNGs are committed."""
import struct
import zlib
import pathlib

BG = (31, 111, 235)    # --accent
FG = (255, 255, 255)


def glyph_pixels(size):
    """A thick sine-like wave across the middle: the course in one mark."""
    import math
    on = set()
    thickness = max(2, size // 12)
    for x in range(size):
        phase = (x / size) * 2 * math.pi * 1.5
        y = size / 2 - math.sin(phase) * size * 0.22
        for dy in range(-thickness // 2, thickness // 2 + 1):
            yy = int(y) + dy
            if 0 <= yy < size:
                on.add((x, yy))
    return on


def write_png(path, size):
    on = glyph_pixels(size)
    raw = bytearray()
    for y in range(size):
        raw.append(0)                      # filter type 0 for each scanline
        for x in range(size):
            raw.extend(FG if (x, y) in on else BG)

    def chunk(tag, data):
        out = struct.pack('>I', len(data)) + tag + data
        return out + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    path.write_bytes(png)
    print(f'{path}: {size}x{size}, {len(png)} bytes')


def main():
    out = pathlib.Path('icons')
    out.mkdir(exist_ok=True)
    write_png(out / 'icon-192.png', 192)
    write_png(out / 'icon-512.png', 512)


if __name__ == '__main__':
    main()
```

Run it:

```bash
python3 tools/make-icons.py
```

Expected: two PNGs written. This uses only the standard library, so it needs no Pillow.

- [ ] **Step 2: Write `manifest.json`**

```json
{
  "name": "Applied Programming Exam Prep",
  "short_name": "AP Prep",
  "description": "Reference bank and quiz for FAU module 92402, Applied Programming.",
  "start_url": ".",
  "scope": ".",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0d1117",
  "theme_color": "#1f6feb",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

`start_url` and `scope` are `"."`, not `"/"`. An absolute `/` would scope the installed app to the domain root, which on `anjannis.github.io` is a different site entirely.

- [ ] **Step 3: Write `tools/build-precache.js`**

Hand-maintaining a 40-plus entry precache list across nine content chapters and twenty KaTeX fonts is exactly the kind of list that silently drifts. Generate it.

```js
// tools/build-precache.js
// Regenerate the PRECACHE array inside sw.js from what is actually on disk.
// Run after adding content chapters or changing assets: node tools/build-precache.js
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chapterFiles } = require('./load-bank.js');

const ROOT = path.join(__dirname, '..');

function listFonts() {
  const dir = path.join(ROOT, 'vendor/katex/fonts');
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.woff2'))   // only woff2: see Task 1 Step 2
    .sort()
    .map((name) => 'vendor/katex/fonts/' + name);
}

function buildList() {
  return [
    '.',
    'index.html',
    'style.css',
    'app.js',
    'manifest.json',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'vendor/katex/katex.min.css',
    'vendor/katex/katex.min.js',
    'lib/router.js',
    'lib/content-index.js',
    'lib/search.js',
    'lib/quiz-engine.js',
    'lib/progress-store.js',
    'views/reference-view.js',
    'views/quiz-view.js',
    'views/progress-view.js',
    'content.js',
    'questions.js'
  ]
    .concat(chapterFiles('content'))
    .concat(chapterFiles('questions'))
    .concat(listFonts());
}

function main() {
  const files = buildList();

  const missing = files.filter(
    (rel) => rel !== '.' && !fs.existsSync(path.join(ROOT, rel))
  );
  if (missing.length > 0) {
    console.error('missing files:');
    missing.forEach((m) => console.error('  - ' + m));
    process.exit(1);
  }

  const swPath = path.join(ROOT, 'sw.js');
  const source = fs.readFileSync(swPath, 'utf8');
  const block =
    'var PRECACHE = [\n' +
    files.map((f) => "  '" + f + "'").join(',\n') +
    '\n];';

  const next = source.replace(
    /var PRECACHE = \[[\s\S]*?\];/,
    block
  );
  if (next === source && source.indexOf('var PRECACHE') !== -1) {
    console.log('precache list unchanged');
  }

  // Bump the cache version so installed copies pick the new content up.
  const stamped = next.replace(
    /var CACHE = 'ap-exam-prep-v(\d+)'/,
    (match, n) => "var CACHE = 'ap-exam-prep-v" + (Number(n) + 1) + "'"
  );

  fs.writeFileSync(swPath, stamped);
  console.log(`sw.js: ${files.length} precache entries`);
}

main();
```

- [ ] **Step 4: Write `sw.js`**

```js
// Cache-first service worker. The PRECACHE array and CACHE version are
// rewritten by tools/build-precache.js -- edit that, not this list.
var CACHE = 'ap-exam-prep-v1';

var PRECACHE = [
  '.',
  'index.html'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // addAll is atomic: one 404 rejects the whole install, which is what we
      // want -- a half-populated cache is worse than no cache.
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) return hit;

      return fetch(request).then(function (response) {
        // Only cache real same-origin successes; an opaque or error response
        // cached here would be served forever.
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
        return response;
      }).catch(function () {
        // Offline and uncached: fall back to the shell so a deep link still
        // opens the app rather than the browser's dinosaur.
        return caches.match('index.html');
      });
    })
  );
});
```

- [ ] **Step 5: Generate the real precache list**

```bash
node tools/build-precache.js
```

Expected: `sw.js: N precache entries` with N around 40, and `CACHE` bumped to `ap-exam-prep-v2`. If it reports missing files, a script tag and the generator have drifted — fix the generator's list to match `index.html`.

- [ ] **Step 6: Link the manifest and register the worker in `index.html`**

In `<head>`:

```html
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
```

At the end of `<body>`, after the view scripts:

```html
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    // Relative path: registers with a scope of this directory, which is what a
    // project-page deployment at /<repo>/ needs.
    navigator.serviceWorker.register('sw.js').catch(function (err) {
      console.warn('Service worker registration failed:', err);
    });
  });
}
</script>
```

- [ ] **Step 7: Verify installation and offline operation**

1. Reload `http://localhost:8765/ap-exam-prep/` twice — the first load registers, the second is served through the worker.
2. Confirm registration by evaluating in the page:

```js
navigator.serviceWorker.getRegistrations().then(r => r.map(x => x.scope))
```

Expected: one scope ending `/ap-exam-prep/`. A scope of `/` means the path was written absolute.

3. Confirm the cache is populated. Check the name exists *before* opening it — `caches.open` creates a missing cache and would report 0 keys instead of failing, so opening it first cannot detect a wrong version name:

```js
caches.keys().then(names => names.includes('ap-exam-prep-v2')
  ? caches.open('ap-exam-prep-v2').then(c => c.keys()).then(k => ({names, entries: k.length}))
  : {names, error: 'expected cache name absent'})
```

Expected: `names` contains exactly `ap-exam-prep-v2` and `entries` equals the count from Step 5.

4. Stop the dev server, then reload the page. The app must still load, render KaTeX formulas with the vendored fonts, run a quiz, and show progress. Then restart the server.

5. Check the console for manifest errors. An icon 404 or a `start_url` outside scope both surface there.

- [ ] **Step 8: Commit**

```bash
git add manifest.json sw.js icons/ tools/make-icons.py tools/build-precache.js index.html
git commit -m "feat: installable pwa with generated cache-first precache list"
```

---

### Task 14: Author the remaining eight chapters

**Files:**
- Create: `content/l1.js`, `content/l3.js` … `content/l9.js`
- Create: `questions/l1.js`, `questions/l3.js` … `questions/l9.js`
- Modify: `index.html` (add the sixteen script tags)

**Interfaces:**
- Consumes: the schema, id rules and style contract established by `content/l2.js` and `questions/l2.js` in Task 3
- Produces: a complete nine-chapter bank

This is the bulk of the work and the eight chapters are independent, so dispatch them in parallel — one author per chapter — then reconcile in Task 15.

- [ ] **Step 1: Dispatch one author per chapter**

Dispatch eight agents concurrently. Each receives the brief below with its own row substituted. Give every agent the *same* brief text apart from that row, because divergent briefs are the main source of the drift Task 15 has to clean up.

| Chapter | Title | Script pages (PDF) | Deck | Must own these cross-cutting keys |
|---|---|---|---|---|
| 1 | Foundations in Mechanics and Biomechanics | 6–13 | `1. Foundations in BioMechanics.pdf` | — |
| 3 | Vectors, Matrices and Convolutions | 26–35 | `3. Vectors, matrices, convolution.pdf` | `convolution`, `bias-variance` |
| 4 | The Electromyogram | 36–43 | `4. EMG.pdf` | `convolution`, `information-loss` |
| 5 | The Art of Simulation | 44–49 | `5. The Art of Simulation.pdf` | `bias-variance` |
| 6 | Talking to the Analog Signal: Sensors and the ADC | 50–57 | `6. Talking to the ADC.pdf` | `information-loss`, `separation-of-concerns` |
| 7 | Introduction to Arduino | 58–67 | `7. Intro to Arduino.pdf` | `convolution`, `information-loss` |
| 8 | The Final Project: A TCP Signal Visualisation Application | 68–85 | (no deck; final-project README content) | `separation-of-concerns` |
| 9 | The Big Picture: How Everything Connects | 86–93 | (no deck) | all four |

The brief given to each agent:

> Author two files for Chapter N of the FAU Applied Programming exam script: `content/lN.js` and `questions/lN.js`.
>
> **Read first, in this order:**
> 1. `.source/script.txt`, pages `=== PAGE A ===` through `=== PAGE B ===` — this is your primary source.
> 2. `docs/superpowers/specs/2026-09-17-ap-exam-prep-design.md` — the content model.
> 3. `content/l2.js` and `questions/l2.js` — the style contract. Match their voice, depth, sentence length and difficulty calibration exactly. This matters more than any instruction below.
> 4. Appendix A of the script (PDF pages 94–97) for any formula belonging to your chapter.
> 5. Your lecture deck, listed above, if you have one — scan it for slide-only material the script compressed away, especially NumPy/SciPy idioms and Arduino specifics. Add what it uniquely contributes; do not duplicate the script.
>
> **Write `content/lN.js`:** a single `LECTURES.push({...})` call with `id`, `name`, `shortName`, and `sections` following the script's own subsection order.
> - 25–40 items total.
> - Every item carries all seven keys: `id`, `type`, `term`, `body`, `formula`, `symbols`, `crossRef`. Use `null` for inapplicable scalars and `[]` for no cross-references.
> - `id` is `lN-<kebab-slug>`, unique and descriptive.
> - `type` is one of `definition`, `formula`, `distinction`, `fact`, `pitfall`. Use `pitfall` for the script's orange "mistakes that cost marks" boxes; include every one in your range.
> - `body` is 1–3 sentences of exam-ready prose stating the thing itself. Never write "the lecture explains that…" or restate a section title.
> - Every item with a `formula` also has `symbols`: what each symbol means and when the formula applies.
> - `crossRef` values come only from this list: `bias-variance`, `convolution`, `information-loss`, `separation-of-concerns`. Your chapter must populate the keys listed for it above. Do not invent keys.
>
> **Write `questions/lN.js`:** a single `QUESTIONS.push(...)` call.
> - 15–20 questions, ids sequential from `lN-001`, matching `lN-<3 digits>`.
> - 55–65% must be `mode: 'mc'`; the rest `mode: 'short'`.
> - `mc` questions have exactly four distinct options and a `correctIndex` of 0–3. `short` questions carry neither field.
> - Every question needs a `topic` tag — short, lowercase, reused across chapters where the concept recurs. Prefer an existing tag from `questions/l2.js` over a new synonym.
> - Every `contentRef` must name an id you actually defined in your `content/lN.js`.
> - MC distractors must be plausible near-misses: a common confusion, an adjacent concept, or a true statement that does not answer the question asked. No filler options.
> - Prefer "why" and distinction questions over pure recall wherever the script supports it.
> - Seed short-answer model answers from the exam-style questions at the end of your script chapter, in the course's own wording.
>
> **Before you finish**, run `node tools/validate.js --no-counts` and fix anything it reports about your two files. Ignore problems attributed to other chapters. Then confirm your chapter's own counts are in range.
>
> Write only these two files. Do not modify `index.html`, other chapters, or any shared file.
>
> The exam is written, mostly definitions and short answers, not calculation-heavy. Prioritise precise wording of definitions, distinctions and the reasoning behind formulas over worked numeric examples.

- [ ] **Step 2: Add the sixteen script tags to `index.html`**

In chapter order, after `content.js` and `questions.js` respectively:

```html
<script src="content.js"></script>
<script src="content/l1.js"></script>
<script src="content/l2.js"></script>
<script src="content/l3.js"></script>
<script src="content/l4.js"></script>
<script src="content/l5.js"></script>
<script src="content/l6.js"></script>
<script src="content/l7.js"></script>
<script src="content/l8.js"></script>
<script src="content/l9.js"></script>
<script src="questions.js"></script>
<script src="questions/l1.js"></script>
<script src="questions/l2.js"></script>
<script src="questions/l3.js"></script>
<script src="questions/l4.js"></script>
<script src="questions/l5.js"></script>
<script src="questions/l6.js"></script>
<script src="questions/l7.js"></script>
<script src="questions/l8.js"></script>
<script src="questions/l9.js"></script>
```

- [ ] **Step 3: Run the full validator**

```bash
node tools/validate.js
```

Expected: `ok: 9 chapters, N items, M questions`, N in 225–360, M in 135–180. Fix any reported problem before continuing — Task 15 is a quality pass, not a correctness backstop.

- [ ] **Step 4: Regenerate the precache list**

The sixteen new data files must be cached offline.

```bash
node tools/build-precache.js
```

Expected: the entry count grows by sixteen and `CACHE` bumps again.

- [ ] **Step 5: Commit**

```bash
git add content/ questions/ index.html sw.js
git commit -m "content: author lectures 1 and 3-9"
```

---

### Task 15: Reconciliation pass

**Files:**
- Modify: any of `content/l*.js`, `questions/l*.js`
- Create: `tools/report-bank.js`

**Interfaces:**
- Consumes: the assembled nine-chapter bank
- Produces: a bank with consistent terminology, no duplicated items, correct cross-reference wiring, and topic tags that actually aggregate

Eight authors working in parallel could not see each other's files. This is the pass that fixes what only becomes visible once the chapters sit together — the load-bearing part of the design, because cross-lecture questions are the ones §9.2 says the exam is likeliest to ask.

- [ ] **Step 1: Write `tools/report-bank.js`**

```js
// tools/report-bank.js
// Surface the things the validator cannot judge: near-duplicate items,
// singleton topic tags, thin cross-cutting groups, unreferenced items.
'use strict';

const { loadBank } = require('./load-bank.js');

function flatten(lectures) {
  const out = [];
  lectures.forEach((lecture) => {
    lecture.sections.forEach((section) => {
      section.items.forEach((item) => {
        out.push(Object.assign({}, item, { lectureId: lecture.id }));
      });
    });
  });
  return out;
}

function normalise(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function main() {
  const bank = loadBank();
  const items = flatten(bank.lectures);

  console.log('== chapter sizes ==');
  bank.lectures.forEach((lecture) => {
    const itemCount = lecture.sections.reduce((n, s) => n + s.items.length, 0);
    const questions = bank.questions.filter((q) => q.lecture === lecture.id);
    const mc = questions.filter((q) => q.mode === 'mc').length;
    console.log(
      `  L${lecture.id}: ${itemCount} items, ${questions.length} questions ` +
      `(${mc} mc / ${questions.length - mc} short)`
    );
  });

  console.log('\n== items with the same term in different chapters ==');
  const byTerm = {};
  items.forEach((item) => {
    const key = normalise(item.term);
    (byTerm[key] = byTerm[key] || []).push(item);
  });
  Object.keys(byTerm).forEach((key) => {
    const group = byTerm[key];
    if (group.length > 1) {
      console.log(`  "${group[0].term}": ${group.map((i) => i.id).join(', ')}`);
    }
  });

  console.log('\n== cross-cutting group coverage ==');
  bank.groups.forEach((group) => {
    const hits = items.filter((i) => (i.crossRef || []).indexOf(group.key) !== -1);
    const lectures = Array.from(new Set(hits.map((i) => i.lectureId))).sort((a, b) => a - b);
    console.log(
      `  ${group.key}: ${hits.length} items across L${lectures.join(', L') || '(none)'}`
    );
  });

  console.log('\n== topic tags ==');
  const topics = {};
  bank.questions.forEach((q) => {
    topics[q.topic] = topics[q.topic] || new Set();
    topics[q.topic].add(q.lecture);
  });
  Object.keys(topics).sort().forEach((topic) => {
    const lectures = Array.from(topics[topic]).sort((a, b) => a - b);
    const count = bank.questions.filter((q) => q.topic === topic).length;
    const flag = count === 1 ? '   <- singleton' : '';
    console.log(`  ${topic}: ${count} questions, L${lectures.join(', L')}${flag}`);
  });

  console.log('\n== items no question references ==');
  const referenced = new Set(bank.questions.map((q) => q.contentRef));
  const orphans = items.filter((i) => !referenced.has(i.id));
  console.log(`  ${orphans.length} of ${items.length} items unreferenced`);
  const orphanPitfalls = orphans.filter((i) => i.type === 'pitfall');
  if (orphanPitfalls.length) {
    console.log(`  unreferenced pitfalls (high exam value, consider adding questions):`);
    orphanPitfalls.forEach((i) => console.log(`    - ${i.id}: ${i.term}`));
  }
}

main();
```

- [ ] **Step 2: Run the report**

```bash
node tools/report-bank.js
```

- [ ] **Step 3: Resolve duplicate terms**

For each same-term pair the report lists, decide deliberately:

- **Genuinely the same concept taught once** (for example convolution defined in both L3 and L7) — keep the fuller item, reduce the other to a short chapter-specific framing, and make sure both carry the shared `crossRef` key so the Cross-cutting tab threads them rather than the bank repeating itself.
- **Same word, different concept** — leave both, but sharpen each `term` so the Reference Bank does not show two identical headings.

- [ ] **Step 4: Fix cross-cutting coverage**

Each of the four groups must draw items from the lectures §9.2 names:

- `bias-variance`: L2, L3, L5
- `convolution`: L2, L3, L4, L7
- `information-loss`: L2, L4, L6, L7
- `separation-of-concerns`: L6, L8

If the report shows a group missing one of its lectures, find the item in that lecture that embodies the idea and add the key to its `crossRef`. Do not invent an item to fill the slot — if the concept genuinely is not in that chapter, record why in the commit message instead.

- [ ] **Step 5: Consolidate topic tags**

Every singleton the report flags is a candidate for merging into an existing tag. The tags drive the per-topic accuracy that is supposed to tell the user what to study next, so a tag appearing in one question is noise rather than signal. Merge synonyms — `sampling` into `aliasing`, `quantization` into `quantisation`, and so on — picking one spelling and applying it everywhere.

- [ ] **Step 6: Add questions for unreferenced pitfalls**

Every `pitfall` item the report lists as unreferenced is exam-relevant content with no question drilling it. Add a question for each, respecting the owning chapter's 15–20 count; if a chapter is already at 20, replace its weakest pure-recall question rather than exceeding the cap.

- [ ] **Step 7: Read three chapters end to end for voice**

Pick chapters from three different authors and read their items in the browser. Fix anything where the register jumps — an item that lectures the reader, one that is a bare sentence fragment where its neighbours are full explanations, or a difficulty spike in the questions.

- [ ] **Step 8: Re-run everything**

```bash
node --test && node tools/validate.js && node tools/report-bank.js
```

Expected: all unit tests pass, the validator prints `ok:`, and the report shows every cross-cutting group spanning its expected lectures with no singleton topics.

- [ ] **Step 9: Commit**

```bash
git add content/ questions/ tools/report-bank.js
git commit -m "content: reconcile terminology, topic tags and cross-references"
```

---

### Task 16: README and final verification

**Files:**
- Create: `README.md`
- Modify: `sw.js` (final cache bump)

**Interfaces:**
- Consumes: the finished app
- Produces: a repo ready to push and enable Pages on

- [ ] **Step 1: Write `README.md`**

````markdown
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
4. Choose the `master` branch and the `/ (root)` folder, then **Save**.
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
````

- [ ] **Step 2: Final full-app verification**

Start the dev server and check, at `http://localhost:8765/ap-exam-prep/`:

1. **Reference** — all nine lectures in the nav; search returns hits from several chapters; the Cross-cutting tab shows four groups each spanning multiple lectures with no "No items yet."
2. **Quiz** — scope All plus Mixed reports 135–180 questions; run at least fifteen questions covering both modes; the summary shows a by-topic breakdown with more than a handful of tags.
3. **Reference links** — "View in Reference Bank" from a missed question lands on the right card, highlighted, in the right lecture.
4. **Progress** — the attempt appears; topic accuracy aggregates across lectures; export, reset, and re-import restore it.
5. **Phone width** — repeat a shortened version of 1–4 at 375×812. No horizontal scroll, no zoom on input focus.
6. **Offline** — stop the server, reload, and confirm the whole app still works including formula rendering. Restart the server afterwards.
7. **Console** — clean throughout, with no 404s in the network log.

- [ ] **Step 3: Confirm the test suite and data checks pass**

```bash
node --test && node tools/validate.js && node tools/report-bank.js
```

Expected: all pass. Record the actual item and question counts.

- [ ] **Step 4: Bump the cache version one final time**

```bash
node tools/build-precache.js
```

- [ ] **Step 5: Commit**

```bash
git add README.md sw.js
git commit -m "docs: readme with pages deployment and offline notes"
```

- [ ] **Step 6: Report to the user**

The repo is local-only at this point. Tell the user the counts, the verification results, and the exact next steps they need to take themselves: create the `ap-exam-prep` repository on GitHub, add it as a remote, push, and enable Pages per the README.

---

## Self-Review

**Spec coverage.** Every section of the design document maps to a task: content model → 2, 3, 14; cross-cutting groups → 2, 9, 15; question bank → 3, 14; file layout → File Structure, 1; KaTeX vendoring → 1; app structure and the seven units → 4–11; reference/quiz/progress views → 9, 10, 11; mobile-first and dark mode → 12; offline and manifest → 13; deployment → 16; authoring approach → 3, 14, 15; verification → distributed across every task plus 16.

**Gaps found and closed while reviewing.** The spec's `tools/validate.mjs` name conflicts with CommonJS `require`, so the plan uses `tools/validate.js` and says why. The spec did not say how Node would load browser globals, so `tools/load-bank.js` was added. The spec did not address keeping the precache list in sync across nine chapters, so `tools/build-precache.js` generates it.

**Type consistency.** `summary()` returns `{total, correct, byLecture, byTopic, missed}` in Task 6 and is consumed with those exact keys in Tasks 7, 10 and 11. `ProgressStore.create(storage)` is called with `safeStorage()` in Task 8 and with fakes in Task 7's tests. `App.register(name, {render})` is defined in Task 8 and called in 9, 10 and 11. `ContentIndex.byId` returns a `Map`, and both callers use `.get`. `Router.parse` returns `{view, param}` everywhere.

