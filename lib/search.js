// Substring search over flattened content items. No DOM access.
var Search = (function () {
  'use strict';

  function normalize(text) {
    return String(text == null ? '' : text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function build(items) {
    return items.map(function (item) {
      var parts = [
        item.term,
        item.body,
        item.symbols,
        item.type,
        item.sectionHeading,
        item.lectureName
      ];
      var haystack = normalize(
        parts.filter(function (p) { return p != null; }).join(' ')
      );
      return { item: item, haystack: haystack, termField: normalize(item.term) };
    });
  }

  function query(index, text) {
    var terms = normalize(text).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    var hits = [];
    index.forEach(function (entry) {
      var matchesAll = terms.every(function (term) {
        return entry.haystack.indexOf(term) !== -1;
      });
      if (!matchesAll) return;

      var inTerm = terms.every(function (term) {
        return entry.termField.indexOf(term) !== -1;
      });
      hits.push({ item: entry.item, score: inTerm ? 2 : 1 });
    });

    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.map(function (hit) { return hit.item; });
  }

  return { normalize: normalize, build: build, query: query };
})();

if (typeof module !== 'undefined') module.exports = Search;
