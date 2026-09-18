// tools/report-bank.js
// Quality report over the assembled bank: the things the validator cannot
// judge. The validator answers "is this well-formed?"; this answers "is this
// still coherent as one bank?" Run after editing any chapter.
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

function longestCorrect(questions) {
  return questions.filter((q) => {
    const lengths = q.options.map((o) => String(o).length);
    const max = Math.max.apply(null, lengths);
    return lengths[q.correctIndex] === max &&
      lengths.filter((l) => l === max).length === 1;
  }).length;
}

function main() {
  const bank = loadBank();
  const items = flatten(bank.lectures);
  const problems = [];

  console.log('== chapters ==');
  bank.lectures.slice().sort((a, b) => a.id - b.id).forEach((lecture) => {
    const count = lecture.sections.reduce((n, s) => n + s.items.length, 0);
    const qs = bank.questions.filter((q) => q.lecture === lecture.id);
    const mc = qs.filter((q) => q.mode === 'mc');
    const keys = [0, 0, 0, 0];
    mc.forEach((q) => { keys[q.correctIndex] += 1; });
    const lc = longestCorrect(mc);
    console.log(
      `  L${lecture.id} ${String(count).padStart(3)} items  ` +
      `${String(qs.length).padStart(2)} questions  ` +
      `mc ${(mc.length / qs.length).toFixed(2)}  ` +
      `keys [${keys.join(',')}]  longest ${lc}/${mc.length}`
    );
  });

  const allMc = bank.questions.filter((q) => q.mode === 'mc');
  const bankKeys = [0, 0, 0, 0];
  allMc.forEach((q) => { bankKeys[q.correctIndex] += 1; });
  const bankLongest = longestCorrect(allMc);
  console.log('\n== whole bank ==');
  console.log(`  ${items.length} items, ${bank.questions.length} questions, ${allMc.length} mc`);
  console.log(`  answer position [${bankKeys.join(',')}] = ` +
    bankKeys.map((n) => Math.round(n / allMc.length * 100) + '%').join(' / '));
  console.log(`  correct option is single longest in ${bankLongest}/${allMc.length}` +
    ` (${Math.round(bankLongest / allMc.length * 100)}%)`);
  if (bankLongest / allMc.length > 0.5) {
    problems.push('bank-wide: the correct option is the longest in over half of mc questions');
  }

  console.log('\n== duplicate terms across chapters ==');
  const byTerm = {};
  items.forEach((item) => {
    const key = normalise(item.term);
    (byTerm[key] = byTerm[key] || []).push(item.id);
  });
  const dups = Object.keys(byTerm).filter((k) => byTerm[k].length > 1);
  if (dups.length === 0) {
    console.log('  none');
  } else {
    dups.forEach((k) => {
      console.log(`  "${k}": ${byTerm[k].join(', ')}`);
      problems.push(`duplicate term "${k}"`);
    });
  }

  console.log('\n== cross-cutting coverage ==');
  bank.groups.forEach((group) => {
    const hits = items.filter((i) => (i.crossRef || []).indexOf(group.key) !== -1);
    const lectures = Array.from(new Set(hits.map((i) => i.lectureId))).sort((a, b) => a - b);
    console.log(`  ${group.key.padEnd(24)} ${hits.length} items across L${lectures.join(' L') || '(none)'}`);
    if (hits.length === 0) problems.push(`cross-cutting group "${group.key}" is empty`);
  });

  console.log('\n== topic tags ==');
  const tags = {};
  bank.questions.forEach((q) => { (tags[q.topic] = tags[q.topic] || []).push(q.lecture); });
  const names = Object.keys(tags).sort();
  const thin = names.filter((t) => tags[t].length < 3);
  console.log(`  ${names.length} tags; thinnest ${Math.min.apply(null, names.map((t) => tags[t].length))} questions`);
  if (thin.length) {
    thin.forEach((t) => {
      console.log(`  THIN  ${t}: ${tags[t].length} question(s)`);
      problems.push(`topic tag "${t}" has fewer than 3 questions`);
    });
  } else {
    console.log('  no tag below 3 questions');
  }

  console.log('\n== coverage gaps ==');
  const referenced = new Set(bank.questions.map((q) => q.contentRef));
  const unrefPitfalls = items.filter((i) => i.type === 'pitfall' && !referenced.has(i.id));
  console.log(`  ${items.filter((i) => !referenced.has(i.id)).length} of ${items.length} items unreferenced by any question`);
  if (unrefPitfalls.length === 0) {
    console.log('  every pitfall is drilled by at least one question');
  } else {
    unrefPitfalls.forEach((i) => {
      console.log(`  UNDRILLED PITFALL  ${i.id}: ${i.term}`);
      problems.push(`pitfall "${i.id}" has no question`);
    });
  }

  console.log('\n== formatting ==');
  const latexInSymbols = items.filter((i) => i.symbols && /_\{|\^\{|\\[a-zA-Z]+/.test(i.symbols));
  const numberedAnswers = bank.questions.filter((q) => /\boption [0-3]\b/i.test(q.answer));
  if (latexInSymbols.length === 0) {
    console.log('  no LaTeX in plain-text symbols fields');
  } else {
    latexInSymbols.forEach((i) => {
      console.log(`  LATEX IN SYMBOLS  ${i.id}`);
      problems.push(`item "${i.id}" has LaTeX in its plain-text symbols field`);
    });
  }
  if (numberedAnswers.length === 0) {
    console.log('  no answer cites an option by number');
  } else {
    numberedAnswers.forEach((q) => {
      console.log(`  NUMBERED ANSWER  ${q.id}`);
      problems.push(`question "${q.id}" cites an option by number`);
    });
  }

  console.log('');
  if (problems.length === 0) {
    console.log('ok: no quality problems found');
    process.exit(0);
  }
  console.error(`${problems.length} quality problem(s):`);
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}

main();
