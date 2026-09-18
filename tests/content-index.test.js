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
