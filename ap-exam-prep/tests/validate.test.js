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
  // Assert on the type-specific wording so this test is distinguishable
  // from the generic formula/symbols rule tested below: deleting the
  // `type === 'formula'` branch in validate.js must fail only this test.
  assert.match(problems.join('\n'), /l99-beta.*type is formula but symbols is empty/i);
});

test('a non-formula item carrying a formula still needs symbols', () => {
  const problems = run((lectures) => {
    const item = lectures[0].sections[0].items[0]; // type: 'definition'
    item.formula = 'E = mc^2';
    item.symbols = null;
  });
  // This exercises the generic `!isBlank(formula) && isBlank(symbols)` rule
  // in isolation: the item's type is not 'formula', so the type-specific
  // branch never fires. Deleting the generic check must fail only this test.
  assert.match(problems.join('\n'), /l99-alpha.*no symbols explanation/i);
});

test('a malformed item id slug is reported', () => {
  const bad = ['l99-Alpha', 'l99-al pha', 'l99-al_pha', 'l99-alpha!', 'l99-', 'l99--alpha', 'l99-alpha-', 'l99-alpha--beta'];
  bad.forEach((id) => {
    const problems = run((lectures, questions) => {
      lectures[0].sections[0].items[0].id = id;
      // Repoint the question that referenced the old id so a resulting
      // dangling-contentRef problem cannot be mistaken for the kebab-slug
      // problem this test is checking for.
      questions[1].contentRef = id;
    });
    assert.match(problems.join('\n'), /kebab-slug/i, `expected "${id}" to be rejected`);
  });
});

test('a well-formed item id slug is accepted', () => {
  const good = ['l99-alpha', 'l99-alpha-beta', 'l99-a1', 'l99-sar-adc-2'];
  good.forEach((id) => {
    const problems = run((lectures, questions) => {
      lectures[0].sections[0].items[0].id = id;
      questions[1].contentRef = id;
    });
    assert.deepStrictEqual(problems, [], `expected "${id}" to be accepted`);
  });
});

test('duplicate lecture ids are reported', () => {
  const lectures = [clone(FIXTURE_LECTURE), clone(FIXTURE_LECTURE)];
  const problems = checkAll(lectures, [], GROUPS, { countsEnforced: false });
  assert.match(problems.join('\n'), /duplicate lecture id.*99/i);
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

// --- Answer-key hygiene -----------------------------------------------------
//
// These two checks are chapter-wide properties, so a single-mc-question fixture
// cannot exercise them. Each test builds its own synthetic mc set instead of
// mutating FIXTURE_QUESTIONS.

// n mc questions whose correct answers sit at the positions given, all four
// options padded to the same length so option length carries no signal.
function mcSet(correctIndexes, options) {
  return correctIndexes.map((correctIndex, i) => ({
    id: 'l99-' + String(i + 1).padStart(3, '0'),
    lecture: 99,
    topic: 'fixture',
    mode: 'mc',
    question: 'Synthetic question ' + (i + 1) + '?',
    options: options || ['aaaa', 'bbbb', 'cccc', 'dddd'],
    correctIndex: correctIndex,
    answer: 'Because of the synthetic reason.',
    contentRef: 'l99-alpha'
  }));
}

function runQuestions(questions) {
  return checkAll([clone(FIXTURE_LECTURE)], questions, GROUPS, { countsEnforced: false });
}

test('an over-used correctIndex position is reported', () => {
  // 12 questions, so maxAllowed = ceil(12/4) + 1 = 4. Five at position 1 trips.
  const problems = runQuestions(mcSet([1, 1, 1, 1, 1, 0, 0, 2, 2, 3, 3, 0]));
  assert.match(problems.join('\n'), /correctIndex 1 used 5 of 12.*max 4.*guessable/i);
});

test('an unused correctIndex position is reported once there are eight mc questions', () => {
  const problems = runQuestions(mcSet([0, 0, 1, 1, 2, 2, 0, 1]));
  assert.match(problems.join('\n'), /correctIndex 3 never used across 8/i);
});

test('a balanced correctIndex distribution is accepted', () => {
  assert.deepStrictEqual(runQuestions(mcSet([0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3])), []);
});

test('the answer-balance check runs even with counts disabled', () => {
  // The whole point of leaving it outside the countsEnforced gate: chapter
  // authors validate a one-chapter bank with --no-counts.
  const questions = mcSet([1, 1, 1, 1, 1, 0, 0, 2, 2, 3, 3, 0]);
  const gated = checkAll([clone(FIXTURE_LECTURE)], questions, GROUPS, { countsEnforced: false });
  assert.match(gated.join('\n'), /answer position must not be guessable/i);
});

test('fewer than four mc questions are exempt from the balance check', () => {
  assert.deepStrictEqual(runQuestions(mcSet([1, 1, 1])), []);
});

test('the correct option being the single longest too often is reported', () => {
  // 4 of 4 questions have a long correct option and three short distractors.
  const long = 'the correct option, at considerable length';
  const questions = mcSet([0, 1, 2, 3]).map((question) => {
    const options = ['aaaa', 'bbbb', 'cccc', 'dddd'];
    options[question.correctIndex] = long;
    return Object.assign({}, question, { options: options });
  });
  const problems = runQuestions(questions);
  assert.match(problems.join('\n'), /single longest in 4 of 4.*100%.*length must not signal/i);
});

test('option length bias is not reported when the longest option ties', () => {
  // Two options share the maximum length in every question, so being longest
  // carries no signal and the check must not count it.
  const questions = mcSet([0, 1, 2, 3]).map((question) => {
    const options = ['aaaa', 'bbbb', 'cccc', 'dddd'];
    options[question.correctIndex] = 'a much longer option here';
    options[(question.correctIndex + 1) % 4] = 'b much longer option here';
    return Object.assign({}, question, { options: options });
  });
  assert.deepStrictEqual(runQuestions(questions), []);
});

test('option length bias at exactly half the questions is accepted', () => {
  const questions = mcSet([0, 1, 2, 3]).map((question, i) => {
    const options = ['aaaa', 'bbbb', 'cccc', 'dddd'];
    // Lengthen the correct option in the first two only.
    const target = i < 2 ? question.correctIndex : (question.correctIndex + 1) % 4;
    options[target] = 'a distinctly longer option';
    return Object.assign({}, question, { options: options });
  });
  assert.deepStrictEqual(runQuestions(questions), []);
});

test('question counts are enforced when countsEnforced is true', () => {
  const lectures = [clone(FIXTURE_LECTURE)];
  const questions = clone(FIXTURE_QUESTIONS);
  const problems = checkAll(lectures, questions, GROUPS, { countsEnforced: true });
  assert.match(problems.join('\n'), /chapter 99/i);
});
