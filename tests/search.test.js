// tests/search.test.js
const test = require('node:test');
const assert = require('node:assert');
const Search = require('../lib/search.js');

const ITEMS = [
  {
    id: 'l2-nyquist',
    type: 'formula',
    term: 'Nyquist–Shannon sampling theorem',
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
