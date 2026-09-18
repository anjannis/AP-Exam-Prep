// Question set building, session tracking and scoring. No DOM access.
var QuizEngine = (function () {
  'use strict';

  function shuffle(array, rng) {
    var random = rng || Math.random;
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var swap = array[i];
      array[i] = array[j];
      array[j] = swap;
    }
    return array;
  }

  function build(questions, options) {
    var scope = options.lectures;
    var mode = options.mode;

    var pool = questions.filter(function (question) {
      var lectureOk = scope === 'all' || scope.indexOf(question.lecture) !== -1;
      var modeOk = mode === 'mixed' || question.mode === mode;
      return lectureOk && modeOk;
    });

    return shuffle(pool, options.rng);
  }

  function bump(accumulator, key, correct) {
    if (!accumulator[key]) accumulator[key] = { correct: 0, total: 0 };
    accumulator[key].total += 1;
    if (correct) accumulator[key].correct += 1;
  }

  function summarize(results) {
    var byLecture = {};
    var byTopic = {};
    var correct = 0;

    results.forEach(function (result) {
      if (result.correct) correct += 1;
      bump(byLecture, result.question.lecture, result.correct);
      bump(byTopic, result.question.topic, result.correct);
    });

    return {
      total: results.length,
      correct: correct,
      byLecture: byLecture,
      byTopic: byTopic,
      missed: results
        .filter(function (result) { return !result.correct; })
        .map(function (result) { return result.question; })
    };
  }

  function create(questionSet) {
    var index = 0;
    var results = [];

    return {
      total: questionSet.length,
      current: function () {
        return index < questionSet.length ? questionSet[index] : null;
      },
      position: function () { return index; },
      record: function (correct) {
        if (index >= questionSet.length) return;
        results.push({ question: questionSet[index], correct: !!correct });
        index += 1;
      },
      isDone: function () { return index >= questionSet.length; },
      results: function () {
        // Copy each wrapper: .slice() alone protects the array but shares the
        // result objects, so a caller assigning to .correct would rewrite the
        // session's own record. `question` stays a shared reference on purpose
        // -- it is the object from the QUESTIONS bank, and copying it would
        // break identity comparisons for no benefit.
        return results.map(function (result) {
          return { question: result.question, correct: result.correct };
        });
      },
      summary: function () { return summarize(results); }
    };
  }

  return { shuffle: shuffle, build: build, create: create, summarize: summarize };
})();

if (typeof module !== 'undefined') module.exports = QuizEngine;
