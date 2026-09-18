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

test('mutating a returned result does not corrupt the session', () => {
  const session = QuizEngine.create(QUESTIONS.slice(0, 2));
  session.record(true);
  session.record(true);

  const leaked = session.results();
  leaked[0].correct = false;

  assert.strictEqual(session.results()[0].correct, true);
  assert.strictEqual(session.summary().correct, 2);
  assert.deepStrictEqual(session.summary().missed, []);
});
