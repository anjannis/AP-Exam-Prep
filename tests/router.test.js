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
