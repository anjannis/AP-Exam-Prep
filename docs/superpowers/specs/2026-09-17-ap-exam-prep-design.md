# Applied Programming Exam Prep — Design

**Date:** 2026-09-17
**Module:** FAU 92402, Applied Programming, B.Sc. Artificial Intelligence (PO 20242)
**Status:** Approved

## Purpose

A static, offline-capable browser app for revising Applied Programming, built
around two linked parts:

1. **Reference Bank** — a browsable cheat sheet of every exam-testable fact,
   definition, formula and distinction in the course.
2. **Quiz** — questions drawn from that same content, with scoring, per-topic
   breakdown and progress tracking across attempts.

Single user, single browser. No accounts, no backend, no cross-device sync, no
spaced repetition.

## Source material

Located in `../Applied-Programming-2026/applied_programming_project/Lecture slides/`.

**Primary: `Applied_Programming_Exam_Script.pdf`** (101 pages). A study script
compiled from the seven lecture decks plus the final-project README. It extracts
as clean prose (~190k characters) and is structured for exactly this purpose:

- Nine chapters (seven lectures, the final project, a synthesis chapter)
- Blue boxes: material to memorise verbatim
- Orange boxes: mistakes that cost marks
- Exam-style questions with model answers at the end of each chapter
- Appendix A: formula and command cheat sheet
- Appendix B: glossary
- §9.2: the four ideas that recur across lectures
- §9.5: ten cross-lecture questions

**Secondary: the seven lecture decks** (~273 slides). These extract as sparse
bullet fragments — Lecture 6 yields 7.7k characters across 32 slides — so they
serve as a gap check rather than a primary source. Each is scanned after its
script chapter is authored, to recover slide-only material: NumPy/SciPy idioms,
Arduino specifics, and figures the script compressed away.

The exam is written, mostly definitions and short answers, not
calculation-heavy. Content therefore prioritises precise exam-ready wording of
definitions, distinctions and the reasoning behind formulas over worked numeric
examples.

## Content model

### Item types

Your prompt's four types plus one addition:

| Type | Use |
|---|---|
| `definition` | A term and its exam-ready definition |
| `formula` | An equation, its symbols, and when it applies |
| `distinction` | An "X vs Y" the lecture explicitly draws |
| `fact` | A value, convention or claim worth recalling |
| `pitfall` | **Added.** The script's orange "mistakes that cost marks" boxes |

`pitfall` exists because those boxes are the highest-value exam content in the
script and fit none of the other four types. They are rendered with distinct
styling in the Reference Bank so they stand out during revision.

### Schema

```js
// content.js declares the array; content/l1.js … l9.js push onto it.
const LECTURES = [];

// each content/lN.js:
LECTURES.push({
  id: 2,
  name: "Signals: Time, Frequency and the Digital World",
  shortName: "Signals & Frequency",
  sections: [
    {
      heading: "From analog to digital",
      items: [
        {
          id: "l2-nyquist",           // unique, stable, referenced by questions
          type: "formula",
          term: "Nyquist–Shannon sampling theorem",
          body: "…",                  // 1–3 sentences, exam-ready
          formula: "f_s > 2 f_{max}", // LaTeX, or null
          symbols: "…",               // what each symbol means; null for non-formulas
          crossRef: ["information-loss"]  // cross-cutting group keys
        }
      ]
    }
  ]
});
```

`symbols` is an addition to the prompt's schema, which asked for "a one-line
explanation of what each symbol means and when the formula applies" but gave it
no field. Keeping it separate from `body` lets the UI render it as a distinct
sub-line under the rendered formula.

### Item ids

`l<chapter>-<slug>`, where the slug is a short kebab-case name for the concept:
`l2-nyquist`, `l6-sar-adc`, `l7-rc-cutoff`, `l8-mvvm-contracts`. Chapter-scoped,
so parallel authoring cannot collide. Questions reference items by this id via
`contentRef`.

### Cross-cutting groups

Taken from §9.2 of the script rather than invented, since that section states
which cross-lecture threads the exam is likely to test. Four groups, declared
once in `content.js`:

| Key | Title | Spans |
|---|---|---|
| `bias-variance` | The bias–variance trade-off in four costumes | L2 envelope window, L2 Welch segment length, L3 kernel length, L5 level of detail |
| `convolution` | Convolution is everywhere | L2 moving-average envelope, L3 windows and kernels, L4 EMG generation model, L7 RC filter "in copper" |
| `information-loss` | Information is destroyed at three identifiable places | Aliasing at the sampler (L2, L6), quantisation at the converter (L2, L6, L7), spectral overlap at the filter (L2, L4) |
| `separation-of-concerns` | Separation of concerns, in hardware and software | L6 conversion handshake, L8 MVVM contracts |

Each group has a title and a short connective paragraph explaining the thread.
The Cross-cutting view lists the group's prose followed by every item carrying
that key, grouped by lecture, so a thread can be revised end to end.

## Question bank

```js
const QUESTIONS = [];   // questions.js; questions/lN.js push onto it

QUESTIONS.push({
  id: "l2-014",
  lecture: 2,
  topic: "aliasing",      // short tag, drives score breakdown
  mode: "mc",             // "mc" | "short"
  question: "…",
  options: ["…", "…", "…", "…"],   // mc only
  correctIndex: 2,                  // mc only
  answer: "…",            // model answer; shown for short, explanation for mc
  contentRef: "l2-nyquist"
});
```

Targets: 15–20 questions per chapter, ~150 total across nine chapters. Roughly
60% `mc`, 40% `short`.

- MC distractors are plausible near-misses — a common confusion or an adjacent
  concept — not filler.
- "Why" and distinction questions are preferred over pure recall wherever the
  script supports it.
- The script's own chapter-end exam questions and its ten cross-lecture
  questions (§9.5) seed the short-answer set, in the course's own wording.
- Every question carries a `contentRef` to a real Reference Bank item, so a
  missed question links straight to the explanation.

## File layout

```
ap-exam-prep/
  index.html
  app.js
  style.css
  content.js              declares LECTURES + CROSS_CUTTING groups
  content/l1.js … l9.js   one chapter each, push onto LECTURES
  questions.js            declares QUESTIONS
  questions/l1.js … l9.js one chapter each, push onto QUESTIONS
  vendor/katex/           katex.min.css, katex.min.js, fonts/
  manifest.json
  sw.js
  icons/icon-192.png, icon-512.png
  tools/validate.mjs      local-only; not served
  README.md
```

The prompt named a single `content.js` and `questions.js`. Exhaustive coverage of
nine chapters puts each at roughly 200 KB, which is too large to author and
revise reliably. Splitting per chapter keeps each file small while preserving
every constraint that mattered: plain `<script>` tags, no build step, no `fetch`
(so the app also runs from `file://`), and no change to the data shape the app
consumes.

Script order in `index.html`: `content.js`, then `content/l1…l9.js`, then
`questions.js`, then `questions/l1…l9.js`, then `app.js`.

**Every path is relative with no leading `/`.** This is the failure the prompt
singles out: GitHub Pages serves a project site from `/<repo>/`, so an absolute
path resolves against the wrong root and silently 404s. Applies to scripts,
stylesheet, manifest, icons, and the service worker registration and its
precache list.

## KaTeX

Vendored into `vendor/katex/` rather than loaded from jsdelivr. The prompt
permitted either, but CDN plus service-worker caching is fragile: KaTeX fetches
its `woff2` fonts lazily, so offline correctness would depend on a hand-written
precache list of font URLs staying in sync with KaTeX's internals. Vendoring
(~1.2 MB) makes formula rendering work offline with no CDN dependency, no
first-load network caveat in the README, and no font-list maintenance.

Rendering: `katex.renderToString` with `throwOnError: false`, called on
`item.formula` when a card renders.

## App structure

`app.js`, plain JS, no framework. Three top-level views behind a hash router
(`#/reference`, `#/quiz`, `#/progress`), which gives back/forward and shareable
deep links to items (`#/reference/l2-nyquist`) without a server-side rewrite —
relevant because Pages cannot rewrite unknown paths to `index.html`.

Internal split, one concern each:

| Unit | Responsibility |
|---|---|
| `router` | Parse and dispatch on hash; nothing else |
| `referenceView` | Render lecture nav, sections, items, search, cross-cutting tab |
| `search` | Index and filter items by term/body/keyword |
| `quizEngine` | Build a question set from scope + mode, track answers; no DOM |
| `quizView` | Render questions, capture responses, drive `quizEngine` |
| `progressStore` | `localStorage` read/write, attempt records, export/import; no DOM |
| `progressView` | Render trend and per-topic accuracy |

`quizEngine` and `progressStore` hold no DOM references, which is what makes
them checkable from `tools/validate.mjs` and from the console without a
rendered page.

### Reference Bank view

Lecture nav (nine entries) with collapsible sections. Search box filtering
across all lectures by term and body text. A Cross-cutting tab rendering the
four groups. Formulas rendered by KaTeX, never shown as raw LaTeX. `pitfall`
items styled distinctly.

### Quiz view

Scope: one lecture, several, or all. Mode: MC, short, or mixed.

- **MC** — tap an option, get immediate correct/incorrect plus the explanation.
- **Short** — think or type an answer, tap Reveal, see the model answer,
  self-mark Correct or Incorrect.
- Every question shows a "View in Reference Bank" link resolved from `contentRef`.

End-of-quiz summary: score, breakdown by lecture *and* by topic tag, and the list
of missed questions. A "Retry missed questions" button re-quizzes just those.

### Progress

Attempts stored in `localStorage` under one namespaced key: date, scope, mode,
score, per-topic breakdown. The progress view shows a score trend over time as a
simple table or bar list — no charting library — plus running per-topic accuracy
across all attempts, which is the number that should drive what to revise next.

"Reset progress" requires a confirmation. Export downloads progress as a
timestamped `.json` via a Blob and an object URL. Import reads a chosen file,
validates its shape, then **merges** — attempts from both sides are combined and
de-duplicated by attempt timestamp, rather than the file replacing what is
already stored. Merge is the right default here because the whole point is
carrying progress between two browsers that each hold real attempts; a replace
would silently discard one device's history. The confirmation states how many
attempts will be added before anything is written. Export/import is the only way
progress moves between phone and desktop, by design.

Storage failures — Safari private mode, quota exceeded — are caught, and the app
continues in a session-only mode with a visible notice rather than breaking.

## Design

Mobile-first: laid out for one-handed portrait use, then scaled up. Bottom tab
bar for the three views on narrow screens, converting to a side nav at desktop
width. Large tap targets for MC options and self-mark buttons. No
hover-dependent interaction anywhere. Body text readable without zooming.
Dark-mode friendly via `prefers-color-scheme`, with colour tokens defined once
on `:root`. Reference Bank presented as a structured study guide — cards with
clear type and term hierarchy, not a wall of text.

## Offline (PWA-lite)

`manifest.json` with name, short name, the two icons, `display: "standalone"`,
theme colour, and `start_url: "."` — relative, so it survives the repo subpath.

`sw.js`: cache-first for the app shell and every content and question file,
precached on install; the KaTeX CSS, JS and fonts are precached too. A cache
version constant is bumped whenever content changes, and stale caches are
deleted on activate, so a content update actually reaches an installed copy.
Registered from `index.html` with a relative scope, guarded on
`'serviceWorker' in navigator`.

## Deployment

Its own git repo at `2. Semester/ap-exam-prep/`, deliberately a sibling of
`Applied-Programming-2026` rather than nested inside it — a standalone repo
inside another repo's working tree causes confusing `git status` output and
accidental commits to the wrong history.

Everything sits at the repo root, Pages deploys from branch root, and the
resulting URL is `https://anjannis.github.io/ap-exam-prep/`. The repo is created
and committed locally; creating the GitHub repo and pushing is the user's step.
The README documents enabling Pages (Settings → Pages → deploy from branch) and
the resulting URL.

## Authoring approach

Hybrid, to balance consistency against wall-clock time:

1. **Spine first** — cross-cutting group definitions, the item-id scheme, the
   item-type list, and one fully authored exemplar chapter that serves as a
   style and difficulty contract.
2. **Parallel chapters** — the remaining chapters authored concurrently against
   that identical contract.
3. **Reconciliation** — a pass over the assembled bank for duplicate items,
   drifting terminology, difficulty calibration, and `crossRef` wiring, since
   cross-lecture threads are the one thing a per-chapter author cannot see.

## Verification

`tools/validate.mjs`, run locally, checks the assembled data:

- every `contentRef` resolves to a real item id
- every item id is unique
- every `crossRef` key names a declared cross-cutting group
- every `mc` question has exactly four options and an in-range `correctIndex`
- every question has a non-empty `answer`
- per-chapter question counts and the MC/short ratio are within target

Then, in the browser: serve from a simulated repo subpath and confirm the console
is clean and no asset 404s; walk a full quiz end to end at phone width, including
reveal, self-mark, summary and retry-missed; export and re-import progress;
confirm the app still loads and renders formulas with the network disabled after
first load.

## Out of scope

User accounts, any backend, cross-device sync, spaced-repetition scheduling,
charting libraries, build tooling, frameworks.
