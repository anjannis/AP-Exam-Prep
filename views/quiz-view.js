// Quiz: scope and mode setup, question flow, summary, retry-missed.
(function () {
  'use strict';

  var state = {
    screen: 'setup',       // 'setup' | 'question' | 'summary'
    scope: { lectures: 'all', mode: 'mixed' },
    selected: {},          // lectureId -> true, used only while on setup
    session: null,
    revealed: false,
    picked: null,
    draft: '',
    lastSummary: null
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function button(className, text, onClick) {
    var node = el('button', className, text);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  }

  function sortedLectures() {
    return LECTURES.slice().sort(function (a, b) { return a.id - b.id; });
  }

  function selectedIds() {
    return Object.keys(state.selected)
      .filter(function (id) { return state.selected[id]; })
      .map(Number)
      .sort(function (a, b) { return a - b; });
  }

  function countAvailable(lectures, mode) {
    return QuizEngine.build(QUESTIONS, { lectures: lectures, mode: mode, rng: function () { return 0; } }).length;
  }

  // ---- setup screen -------------------------------------------------------

  function renderSetup(mount) {
    mount.appendChild(el('h2', 'screen-title', 'Start a quiz'));

    mount.appendChild(el('h3', 'field-label', 'Lectures'));
    var picker = el('div', 'chip-grid');

    var allSelected = selectedIds().length === 0;
    picker.appendChild(
      button('chip-lg' + (allSelected ? ' is-on' : ''), 'All', function () {
        state.selected = {};
        App.render();
      })
    );

    sortedLectures().forEach(function (lecture) {
      var on = !!state.selected[lecture.id];
      picker.appendChild(
        button('chip-lg' + (on ? ' is-on' : ''), 'L' + lecture.id, function () {
          state.selected[lecture.id] = !on;
          App.render();
        })
      );
    });
    mount.appendChild(picker);

    mount.appendChild(el('h3', 'field-label', 'Mode'));
    var modes = el('div', 'chip-grid');
    [
      { key: 'mixed', label: 'Mixed' },
      { key: 'mc', label: 'Multiple choice' },
      { key: 'short', label: 'Short answer' }
    ].forEach(function (mode) {
      var on = state.scope.mode === mode.key;
      modes.appendChild(
        button('chip-lg' + (on ? ' is-on' : ''), mode.label, function () {
          state.scope.mode = mode.key;
          App.render();
        })
      );
    });
    mount.appendChild(modes);

    var ids = selectedIds();
    var scopeValue = ids.length === 0 ? 'all' : ids;
    var available = countAvailable(scopeValue, state.scope.mode);

    mount.appendChild(
      el('p', 'field-note', available + (available === 1 ? ' question' : ' questions') + ' in this scope')
    );

    var start = button('btn btn-primary', 'Start quiz', function () {
      var set = QuizEngine.build(QUESTIONS, {
        lectures: scopeValue,
        mode: state.scope.mode
      });
      state.scope.lectures = scopeValue;
      state.session = QuizEngine.create(set);
      state.screen = 'question';
      state.revealed = false;
      state.picked = null;
      state.draft = '';
      App.render();
    });
    start.disabled = available === 0;
    mount.appendChild(start);

    if (available === 0) {
      mount.appendChild(
        el('p', 'empty', 'No questions match that combination. Try a different mode or more lectures.')
      );
    }
  }

  // ---- question screen ----------------------------------------------------

  function renderProgressBar(mount, session) {
    var bar = el('div', 'qbar');
    var fill = el('div', 'qbar-fill');
    fill.style.width = (session.position() / session.total * 100) + '%';
    bar.appendChild(fill);
    mount.appendChild(bar);
    mount.appendChild(
      el('p', 'qcount', 'Question ' + (session.position() + 1) + ' of ' + session.total)
    );
  }

  function renderRefLink(mount, question) {
    mount.appendChild(
      button('btn btn-link', 'View in Reference Bank', function () {
        App.go('reference', question.contentRef);
      })
    );
  }

  function advance() {
    state.revealed = false;
    state.picked = null;
    state.draft = '';
    if (state.session.isDone()) {
      state.lastSummary = state.session.summary();
      App.store.addAttempt(state.lastSummary, state.scope);
      state.screen = 'summary';
    }
    App.render();
  }

  function renderMultipleChoice(mount, question) {
    var list = el('div', 'options');

    question.options.forEach(function (option, optionIndex) {
      var classes = 'option';
      if (state.revealed) {
        if (optionIndex === question.correctIndex) classes += ' is-correct';
        else if (optionIndex === state.picked) classes += ' is-wrong';
      }

      var node = button(classes, option, function () {
        if (state.revealed) return;
        state.picked = optionIndex;
        state.revealed = true;
        App.render();
      });
      node.disabled = state.revealed;
      list.appendChild(node);
    });

    mount.appendChild(list);

    if (!state.revealed) return;

    var right = state.picked === question.correctIndex;
    mount.appendChild(el('p', 'verdict ' + (right ? 'is-ok' : 'is-bad'), right ? 'Correct' : 'Incorrect'));
    mount.appendChild(el('p', 'model-answer', question.answer));
    renderRefLink(mount, question);

    mount.appendChild(button('btn btn-primary', 'Next', function () {
      state.session.record(right);
      advance();
    }));
  }

  function renderShortAnswer(mount, question) {
    var box = el('textarea', 'answer-box');
    box.rows = 4;
    box.placeholder = 'Write your answer, or just think it through…';
    box.setAttribute('aria-label', 'Your answer');
    // Survives the re-render that Reveal triggers: the whole point of short
    // answer is comparing your own wording against the model answer.
    box.value = state.draft;
    box.addEventListener('input', function () { state.draft = box.value; });
    if (state.revealed) {
      box.readOnly = true;   // locked in once revealed, so the mark is honest
    }
    mount.appendChild(box);

    if (!state.revealed) {
      mount.appendChild(button('btn btn-primary', 'Reveal model answer', function () {
        state.revealed = true;
        App.render();
      }));
      return;
    }

    mount.appendChild(el('h3', 'field-label', 'Model answer'));
    mount.appendChild(el('p', 'model-answer', question.answer));
    renderRefLink(mount, question);

    mount.appendChild(el('p', 'field-label', 'How did you do?'));
    var marks = el('div', 'mark-row');
    marks.appendChild(button('btn btn-ok', 'I was right', function () {
      state.session.record(true);
      advance();
    }));
    marks.appendChild(button('btn btn-bad', 'I was wrong', function () {
      state.session.record(false);
      advance();
    }));
    mount.appendChild(marks);
  }

  function renderQuestion(mount) {
    var session = state.session;
    var question = session.current();

    if (!question) { advance(); return; }

    renderProgressBar(mount, session);
    mount.appendChild(el('p', 'qmeta', 'Lecture ' + question.lecture + ' · ' + question.topic));
    mount.appendChild(el('h2', 'qtext', question.question));

    if (question.mode === 'mc') renderMultipleChoice(mount, question);
    else renderShortAnswer(mount, question);

    mount.appendChild(button('btn btn-quiet', 'End quiz', function () {
      state.lastSummary = session.summary();
      if (state.lastSummary.total > 0) {
        App.store.addAttempt(state.lastSummary, state.scope);
      }
      state.screen = 'summary';
      App.render();
    }));
  }

  // ---- summary screen -----------------------------------------------------

  function renderBreakdown(mount, title, buckets, labelFor) {
    var keys = Object.keys(buckets);
    if (keys.length === 0) return;

    mount.appendChild(el('h3', 'field-label', title));
    var table = el('div', 'breakdown');

    keys.sort(function (a, b) {
      var aPct = buckets[a].correct / buckets[a].total;
      var bPct = buckets[b].correct / buckets[b].total;
      return aPct - bPct;   // weakest first: that is what to study next
    }).forEach(function (key) {
      var bucket = buckets[key];
      var pct = Math.round(bucket.correct / bucket.total * 100);

      var row = el('div', 'breakdown-row');
      row.appendChild(el('span', 'breakdown-label', labelFor(key)));

      var track = el('span', 'breakdown-track');
      var fill = el('span', 'breakdown-fill');
      fill.style.width = pct + '%';
      if (pct < 50) fill.classList.add('is-bad');
      else if (pct < 80) fill.classList.add('is-mid');
      track.appendChild(fill);
      row.appendChild(track);

      row.appendChild(
        el('span', 'breakdown-num', bucket.correct + '/' + bucket.total)
      );
      table.appendChild(row);
    });

    mount.appendChild(table);
  }

  function lectureLabel(id) {
    var lecture = LECTURES.filter(function (l) { return String(l.id) === String(id); })[0];
    return lecture ? 'L' + lecture.id + ' ' + lecture.shortName : 'L' + id;
  }

  function renderSummary(mount) {
    var summary = state.lastSummary;
    var pct = summary.total === 0 ? 0 : Math.round(summary.correct / summary.total * 100);

    mount.appendChild(el('h2', 'screen-title', 'Quiz complete'));
    mount.appendChild(el('p', 'big-score', summary.correct + ' / ' + summary.total));
    mount.appendChild(el('p', 'field-note', pct + '% correct'));

    renderBreakdown(mount, 'By lecture', summary.byLecture, lectureLabel);
    renderBreakdown(mount, 'By topic', summary.byTopic, function (key) { return key; });

    if (summary.missed.length > 0) {
      mount.appendChild(el('h3', 'field-label', 'Missed questions'));
      var list = el('div', 'missed-list');
      summary.missed.forEach(function (question) {
        var row = el('div', 'missed-row');
        row.appendChild(el('p', 'missed-q', question.question));
        row.appendChild(button('btn btn-link', 'View in Reference Bank', function () {
          App.go('reference', question.contentRef);
        }));
        list.appendChild(row);
      });
      mount.appendChild(list);

      mount.appendChild(button('btn btn-primary', 'Retry missed questions', function () {
        state.session = QuizEngine.create(summary.missed.slice());
        state.screen = 'question';
        state.revealed = false;
        state.picked = null;
        state.draft = '';
        App.render();
      }));
    } else if (summary.total > 0) {
      mount.appendChild(el('p', 'verdict is-ok', 'Nothing missed.'));
    }

    mount.appendChild(button('btn btn-quiet', 'New quiz', function () {
      state.screen = 'setup';
      state.session = null;
      App.render();
    }));
  }

  function render(mount) {
    if (state.screen === 'question' && state.session) renderQuestion(mount);
    else if (state.screen === 'summary' && state.lastSummary) renderSummary(mount);
    else { state.screen = 'setup'; renderSetup(mount); }
  }

  App.register('quiz', { render: render });
})();
