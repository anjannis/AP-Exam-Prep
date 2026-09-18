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
