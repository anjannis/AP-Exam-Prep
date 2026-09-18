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
