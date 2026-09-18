// Hash route parsing. Hash rather than path because GitHub Pages cannot
// rewrite unknown paths to index.html, so a path route would 404 on reload.
var Router = (function () {
  'use strict';

  var VIEWS = ['reference', 'quiz', 'progress'];

  function decode(segment) {
    try {
      return decodeURIComponent(segment);
    } catch (err) {
      return segment;
    }
  }

  function parse(hash) {
    var raw = String(hash == null ? '' : hash).replace(/^#/, '').replace(/^\//, '');
    var parts = raw.split('/').filter(Boolean);
    var view = parts[0];

    if (VIEWS.indexOf(view) === -1) {
      return { view: 'reference', param: null };
    }
    return { view: view, param: parts[1] ? decode(parts[1]) : null };
  }

  function format(view, param) {
    return param ? '#/' + view + '/' + encodeURIComponent(param) : '#/' + view;
  }

  return { parse: parse, format: format, VIEWS: VIEWS };
})();

if (typeof module !== 'undefined') module.exports = Router;
