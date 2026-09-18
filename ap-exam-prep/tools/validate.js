// tools/validate.js
// Data integrity checks over the assembled content and question bank.
// Run: node tools/validate.js
'use strict';

const ITEM_TYPES = ['definition', 'formula', 'distinction', 'fact', 'pitfall'];
const MODES = ['mc', 'short'];
const MIN_ITEMS = 25;
const MAX_ITEMS = 40;
const MIN_QUESTIONS = 15;
const MAX_QUESTIONS = 20;
const MIN_MC_RATIO = 0.55;
const MAX_MC_RATIO = 0.65;

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function checkItems(lectures, groupKeys, problems) {
  const seen = new Map();
  const seenLectureIds = new Set();

  lectures.forEach((lecture) => {
    if (!Number.isInteger(lecture.id)) {
      problems.push(`lecture "${lecture.name}": id must be an integer`);
    } else if (seenLectureIds.has(lecture.id)) {
      problems.push(`duplicate lecture id "${lecture.id}"`);
    } else {
      seenLectureIds.add(lecture.id);
    }
    if (isBlank(lecture.name)) problems.push(`lecture ${lecture.id}: name is empty`);
    if (isBlank(lecture.shortName)) problems.push(`lecture ${lecture.id}: shortName is empty`);
    if (!Array.isArray(lecture.sections) || lecture.sections.length === 0) {
      problems.push(`lecture ${lecture.id}: no sections`);
      return;
    }

    lecture.sections.forEach((section) => {
      if (isBlank(section.heading)) {
        problems.push(`lecture ${lecture.id}: a section has an empty heading`);
      }
      if (!Array.isArray(section.items) || section.items.length === 0) {
        problems.push(`lecture ${lecture.id} / "${section.heading}": no items`);
        return;
      }

      section.items.forEach((item) => {
        const where = `item ${item.id || '(missing id)'}`;

        if (isBlank(item.id)) {
          problems.push(`lecture ${lecture.id} / "${section.heading}": an item has no id`);
        } else if (seen.has(item.id)) {
          problems.push(`duplicate item id "${item.id}" (also in lecture ${seen.get(item.id)})`);
        } else {
          seen.set(item.id, lecture.id);
          const expected = `l${lecture.id}-`;
          if (item.id.indexOf(expected) !== 0) {
            problems.push(`${where}: id must start with "${expected}"`);
          } else if (!/^l\d+-[a-z0-9]+(-[a-z0-9]+)*$/.test(item.id)) {
            // The remainder becomes a DOM id and a hash-route param, so it must
            // be a strict kebab slug: lowercase alphanumerics, single hyphens,
            // no leading/trailing/doubled hyphen.
            problems.push(`${where}: id must be l<chapter>-<kebab-slug>, lowercase alphanumerics separated by single hyphens`);
          }
        }

        if (ITEM_TYPES.indexOf(item.type) === -1) {
          problems.push(`${where}: unknown type "${item.type}"`);
        }
        if (isBlank(item.term)) problems.push(`${where}: term is empty`);
        if (isBlank(item.body)) problems.push(`${where}: body is empty`);

        if (item.type === 'formula') {
          if (isBlank(item.formula)) {
            problems.push(`${where}: type is formula but formula is empty`);
          }
          if (isBlank(item.symbols)) {
            problems.push(`${where}: type is formula but symbols is empty`);
          }
        }
        if (!isBlank(item.formula) && isBlank(item.symbols)) {
          problems.push(`${where}: carries a formula but no symbols explanation`);
        }

        if (!Array.isArray(item.crossRef)) {
          problems.push(`${where}: crossRef must be an array`);
        } else {
          item.crossRef.forEach((key) => {
            if (groupKeys.indexOf(key) === -1) {
              problems.push(`${where}: unknown crossRef key "${key}"`);
            }
          });
        }
      });
    });
  });

  return seen;
}

function checkQuestions(questions, itemIds, lectureIds, problems) {
  const seen = new Set();

  questions.forEach((question) => {
    const where = `question ${question.id || '(missing id)'}`;

    if (isBlank(question.id)) {
      problems.push('a question has no id');
    } else if (seen.has(question.id)) {
      problems.push(`duplicate question id "${question.id}"`);
    } else {
      seen.add(question.id);
      if (!/^l\d+-\d{3}$/.test(question.id)) {
        problems.push(`${where}: id must match l<chapter>-<3 digits>`);
      } else if (question.id.indexOf(`l${question.lecture}-`) !== 0) {
        problems.push(`${where}: id does not match lecture ${question.lecture}`);
      }
    }

    if (lectureIds.indexOf(question.lecture) === -1) {
      problems.push(`${where}: lecture ${question.lecture} has no content chapter`);
    }
    if (isBlank(question.topic)) problems.push(`${where}: topic is empty`);
    if (isBlank(question.question)) problems.push(`${where}: question text is empty`);
    if (isBlank(question.answer)) problems.push(`${where}: answer is empty`);

    if (MODES.indexOf(question.mode) === -1) {
      problems.push(`${where}: unknown mode "${question.mode}"`);
    } else if (question.mode === 'mc') {
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        problems.push(`${where}: mc questions need exactly 4 options`);
      } else {
        question.options.forEach((option, index) => {
          if (isBlank(option)) problems.push(`${where}: option ${index} is empty`);
        });
        const unique = new Set(question.options.map((o) => String(o).trim()));
        if (unique.size !== question.options.length) {
          problems.push(`${where}: duplicate option text`);
        }
        if (!Number.isInteger(question.correctIndex) ||
            question.correctIndex < 0 ||
            question.correctIndex > 3) {
          problems.push(`${where}: correctIndex must be an integer 0-3`);
        }
      }
    } else {
      if (question.options !== undefined) {
        problems.push(`${where}: short questions must not carry options`);
      }
      if (question.correctIndex !== undefined) {
        problems.push(`${where}: short questions must not carry correctIndex`);
      }
    }

    if (isBlank(question.contentRef)) {
      problems.push(`${where}: contentRef is empty`);
    } else if (!itemIds.has(question.contentRef)) {
      problems.push(`${where}: contentRef "${question.contentRef}" matches no item`);
    }
  });
}

// Answer-key hygiene. Both of the checks below are whole-chapter properties of
// the question set, not of any one question, and both run unconditionally:
// chapter authors run the validator with --no-counts while their chapter is the
// only one in the bank, and a guessable answer key is a defect at that point
// too. A student must not be able to score a chapter without reading it.

function checkAnswerBalance(questions, problems) {
  var byLecture = {};
  questions.forEach(function (question) {
    if (question.mode !== 'mc') return;
    (byLecture[question.lecture] = byLecture[question.lecture] || []).push(question);
  });

  Object.keys(byLecture).forEach(function (lectureId) {
    var mine = byLecture[lectureId];
    if (mine.length < 4) return;

    var counts = [0, 0, 0, 0];
    mine.forEach(function (question) {
      if (Number.isInteger(question.correctIndex) &&
          question.correctIndex >= 0 && question.correctIndex <= 3) {
        counts[question.correctIndex] += 1;
      }
    });

    var maxAllowed = Math.ceil(mine.length / 4) + 1;
    counts.forEach(function (count, index) {
      if (count > maxAllowed) {
        problems.push(
          'chapter ' + lectureId + ': correctIndex ' + index + ' used ' + count +
          ' of ' + mine.length + ' mc questions, max ' + maxAllowed +
          ' - answer position must not be guessable'
        );
      }
    });

    if (mine.length >= 8) {
      counts.forEach(function (count, index) {
        if (count === 0) {
          problems.push(
            'chapter ' + lectureId + ': correctIndex ' + index +
            ' never used across ' + mine.length + ' mc questions'
          );
        }
      });
    }
  });
}

function checkOptionLengthBias(questions, problems) {
  var byLecture = {};
  questions.forEach(function (question) {
    if (question.mode !== 'mc' || !Array.isArray(question.options)) return;
    (byLecture[question.lecture] = byLecture[question.lecture] || []).push(question);
  });

  Object.keys(byLecture).forEach(function (lectureId) {
    var mine = byLecture[lectureId];
    if (mine.length < 4) return;

    var longest = 0;
    mine.forEach(function (question) {
      var lengths = question.options.map(function (option) { return String(option).length; });
      var max = Math.max.apply(null, lengths);
      var ties = lengths.filter(function (length) { return length === max; }).length;
      // Only counts when the correct option is the single longest: a tie
      // carries no signal.
      if (lengths[question.correctIndex] === max && ties === 1) longest += 1;
    });

    if (longest / mine.length > 0.5) {
      problems.push(
        'chapter ' + lectureId + ': the correct option is the single longest in ' +
        longest + ' of ' + mine.length + ' mc questions (' +
        Math.round(longest / mine.length * 100) + '%) - length must not signal the answer'
      );
    }
  });
}

function checkCounts(lectures, questions, problems) {
  lectures.forEach((lecture) => {
    let itemCount = 0;
    lecture.sections.forEach((section) => {
      itemCount += (section.items || []).length;
    });
    if (itemCount < MIN_ITEMS || itemCount > MAX_ITEMS) {
      problems.push(
        `chapter ${lecture.id}: ${itemCount} items, target ${MIN_ITEMS}-${MAX_ITEMS}`
      );
    }

    const mine = questions.filter((q) => q.lecture === lecture.id);
    if (mine.length < MIN_QUESTIONS || mine.length > MAX_QUESTIONS) {
      problems.push(
        `chapter ${lecture.id}: ${mine.length} questions, target ${MIN_QUESTIONS}-${MAX_QUESTIONS}`
      );
    }
    if (mine.length > 0) {
      const ratio = mine.filter((q) => q.mode === 'mc').length / mine.length;
      if (ratio < MIN_MC_RATIO || ratio > MAX_MC_RATIO) {
        problems.push(
          `chapter ${lecture.id}: mc ratio ${ratio.toFixed(2)}, target ` +
          `${MIN_MC_RATIO}-${MAX_MC_RATIO}`
        );
      }
    }
  });
}

function checkAll(lectures, questions, groups, options) {
  const opts = options || {};
  const problems = [];
  const groupKeys = groups.map((g) => g.key);

  const itemIds = checkItems(lectures, groupKeys, problems);
  const lectureIds = lectures.map((l) => l.id);
  checkQuestions(questions, itemIds, lectureIds, problems);

  // Deliberately outside the countsEnforced gate: see the comment above
  // checkAnswerBalance.
  checkAnswerBalance(questions, problems);
  checkOptionLengthBias(questions, problems);

  if (opts.countsEnforced !== false) {
    checkCounts(lectures, questions, problems);

    // Group coverage is a whole-bank property, like the per-chapter counts:
    // meaningless for a fixture, and meaningless while the bank is only
    // partly authored. Both are gated by the same flag.
    groupKeys.forEach((key) => {
      let used = false;
      lectures.forEach((lecture) => {
        lecture.sections.forEach((section) => {
          (section.items || []).forEach((item) => {
            if ((item.crossRef || []).indexOf(key) !== -1) used = true;
          });
        });
      });
      if (!used) problems.push(`cross-cutting group "${key}" has no items`);
    });
  }

  return problems;
}

module.exports = { checkAll, ITEM_TYPES, MODES };

if (require.main === module) {
  const { loadBank } = require('./load-bank.js');
  const bank = loadBank();
  const problems = checkAll(bank.lectures, bank.questions, bank.groups, {
    countsEnforced: process.argv.indexOf('--no-counts') === -1
  });

  if (problems.length === 0) {
    let items = 0;
    bank.lectures.forEach((l) => l.sections.forEach((s) => { items += s.items.length; }));
    console.log(
      `ok: ${bank.lectures.length} chapters, ${items} items, ` +
      `${bank.questions.length} questions`
    );
    process.exit(0);
  }

  console.error(`${problems.length} problem(s):`);
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
