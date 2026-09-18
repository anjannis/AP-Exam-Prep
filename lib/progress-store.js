// Attempt persistence and accuracy roll-ups. No DOM access; storage injected.
var ProgressStore = (function () {
  'use strict';

  var KEY = 'ap-exam-prep/progress/v1';
  var VERSION = 1;

  function probe(storage) {
    if (!storage) return false;
    try {
      var canary = KEY + '/probe';
      storage.setItem(canary, '1');
      storage.getItem(canary);   // reads can fail independently of writes
      storage.removeItem(canary);
      return true;
    } catch (err) {
      return false;
    }
  }

  function validAttempt(attempt) {
    return attempt &&
      typeof attempt.at === 'string' &&
      attempt.at !== '' &&
      typeof attempt.total === 'number' &&
      typeof attempt.correct === 'number';
  }

  function sortAttempts(attempts) {
    return attempts.slice().sort(function (a, b) {
      return a.at < b.at ? -1 : (a.at > b.at ? 1 : 0);
    });
  }

  function accumulate(attempts, field) {
    var totals = {};
    attempts.forEach(function (attempt) {
      var buckets = attempt[field] || {};
      Object.keys(buckets).forEach(function (key) {
        if (!totals[key]) totals[key] = { correct: 0, total: 0 };
        totals[key].correct += buckets[key].correct || 0;
        totals[key].total += buckets[key].total || 0;
      });
    });
    return totals;
  }

  function create(storage) {
    var persistent = probe(storage);
    var memory = { version: VERSION, attempts: [] };

    function read() {
      if (!persistent) return memory;

      var raw;
      try {
        raw = storage.getItem(KEY);
      } catch (err) {
        // Storage cannot be read at all: demote, the way write() does. Staying
        // "persistent" here is what made a working-looking store return nothing.
        persistent = false;
        return memory;
      }

      if (!raw) return { version: VERSION, attempts: [] };

      try {
        var parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.attempts)) {
          return { version: VERSION, attempts: [] };
        }
        return { version: VERSION, attempts: parsed.attempts.filter(validAttempt) };
      } catch (err) {
        // The payload is corrupt but storage itself works: stay persistent and
        // start clean, so the rest of the session still saves.
        return { version: VERSION, attempts: [] };
      }
    }

    function write(state) {
      if (!persistent) { memory = state; return false; }
      try {
        storage.setItem(KEY, JSON.stringify(state));
        return true;
      } catch (err) {
        // Quota exceeded or storage revoked mid-session: keep working in memory.
        persistent = false;
        memory = state;
        return false;
      }
    }

    function attempts() {
      return sortAttempts(read().attempts);
    }

    function addAttempt(summary, scope, at) {
      var record = {
        at: at || new Date().toISOString(),
        scope: { lectures: scope.lectures, mode: scope.mode },
        total: summary.total,
        correct: summary.correct,
        byTopic: summary.byTopic || {},
        byLecture: summary.byLecture || {}
      };
      var state = read();
      state.attempts.push(record);
      write(state);
      return record;
    }

    function importJSON(text) {
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        throw new Error('That file could not be read as JSON.');
      }
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('That file could not be read as progress data.');
      }
      if (parsed.version !== VERSION) {
        throw new Error(
          'Unsupported progress version ' + parsed.version + '; expected ' + VERSION + '.'
        );
      }
      if (!Array.isArray(parsed.attempts)) {
        throw new Error('That file has no attempts array.');
      }
      parsed.attempts.forEach(function (attempt, index) {
        if (!validAttempt(attempt)) {
          throw new Error('Attempt ' + index + ' is missing required fields.');
        }
      });

      var state = read();
      var known = {};
      state.attempts.forEach(function (attempt) { known[attempt.at] = true; });

      var added = 0;
      var skipped = 0;
      parsed.attempts.forEach(function (attempt) {
        if (known[attempt.at]) { skipped += 1; return; }
        known[attempt.at] = true;
        state.attempts.push(attempt);
        added += 1;
      });

      write(state);
      return { added: added, skipped: skipped };
    }

    return {
      isPersistent: function () { return persistent; },
      attempts: attempts,
      addAttempt: addAttempt,
      topicAccuracy: function () { return accumulate(attempts(), 'byTopic'); },
      lectureAccuracy: function () { return accumulate(attempts(), 'byLecture'); },
      reset: function () {
        memory = { version: VERSION, attempts: [] };
        if (persistent) {
          try { storage.removeItem(KEY); } catch (err) { persistent = false; }
        }
      },
      exportJSON: function () {
        return JSON.stringify(
          { version: VERSION, exportedAt: new Date().toISOString(), attempts: attempts() },
          null,
          2
        );
      },
      importJSON: importJSON
    };
  }

  return { create: create, KEY: KEY, VERSION: VERSION };
})();

if (typeof module !== 'undefined') module.exports = ProgressStore;
