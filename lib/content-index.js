// Flatten and index the content bank. No DOM access.
var ContentIndex = (function () {
  'use strict';

  function flatten(lectures) {
    var out = [];
    lectures.forEach(function (lecture) {
      (lecture.sections || []).forEach(function (section) {
        (section.items || []).forEach(function (item) {
          var copy = {};
          Object.keys(item).forEach(function (key) { copy[key] = item[key]; });
          copy.lectureId = lecture.id;
          copy.lectureName = lecture.name;
          copy.lectureShortName = lecture.shortName;
          copy.sectionHeading = section.heading;
          out.push(copy);
        });
      });
    });
    return out;
  }

  function byId(lectures) {
    var map = new Map();
    flatten(lectures).forEach(function (item) { map.set(item.id, item); });
    return map;
  }

  function byCrossRef(lectures, key) {
    return flatten(lectures).filter(function (item) {
      return (item.crossRef || []).indexOf(key) !== -1;
    });
  }

  function groupByLecture(items) {
    var order = [];
    var buckets = {};
    items.forEach(function (item) {
      if (!buckets[item.lectureId]) {
        buckets[item.lectureId] = {
          lectureId: item.lectureId,
          lectureName: item.lectureName,
          lectureShortName: item.lectureShortName,
          items: []
        };
        order.push(item.lectureId);
      }
      buckets[item.lectureId].items.push(item);
    });
    order.sort(function (a, b) { return a - b; });
    return order.map(function (id) { return buckets[id]; });
  }

  return {
    flatten: flatten,
    byId: byId,
    byCrossRef: byCrossRef,
    groupByLecture: groupByLecture
  };
})();

if (typeof module !== 'undefined') module.exports = ContentIndex;
