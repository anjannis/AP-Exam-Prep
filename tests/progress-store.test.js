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

function readOnlyBrokenStorage() {
  const data = {};
  return {
    getItem: () => { throw new Error('read denied'); },
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; }
  };
}

function readBreaksAfterProbeStorage() {
  const data = {};
  return {
    getItem: (key) => {
      // The probe canary reads fine, so create() reports persistent...
      if (key.endsWith('/probe')) return key in data ? data[key] : null;
      // ...but the real key does not, so read() must be what demotes.
      throw new Error('read denied');
    },
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: (key) => { delete data[key]; }
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

test('a storage that cannot be read degrades to memory', () => {
  const store = ProgressStore.create(readOnlyBrokenStorage());
  assert.strictEqual(store.isPersistent(), false);

  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  assert.strictEqual(store.attempts().length, 1);
  assert.deepStrictEqual(store.topicAccuracy().aliasing, { correct: 2, total: 2 });
});

test('corrupt stored data does not demote persistence', () => {
  const storage = fakeStorage({ 'ap-exam-prep/progress/v1': '{not valid' });
  const store = ProgressStore.create(storage);

  assert.deepStrictEqual(store.attempts(), []);
  assert.strictEqual(store.isPersistent(), true);   // storage works, data was junk

  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');
  assert.strictEqual(ProgressStore.create(storage).attempts().length, 1);
});

test('storage that fails only after the probe demotes on read', () => {
  const store = ProgressStore.create(readBreaksAfterProbeStorage());
  assert.strictEqual(store.isPersistent(), true);   // probe passed

  store.addAttempt(SUMMARY, SCOPE, '2026-09-17T10:00:00.000Z');

  assert.strictEqual(store.isPersistent(), false);  // read() demoted it
  assert.strictEqual(store.attempts().length, 1);   // and the attempt survived in memory
  assert.deepStrictEqual(store.topicAccuracy().aliasing, { correct: 2, total: 2 });
});
