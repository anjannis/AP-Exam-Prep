// Progress: attempt trend, running accuracy, reset, export and import.
(function () {
  'use strict';

  var flash = null;   // {kind: 'ok'|'bad', text: string}, shown once after an action

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

  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) +
      ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function scopeLabel(scope) {
    if (!scope) return '';
    var lectures = scope.lectures === 'all' || !scope.lectures.length
      ? 'All'
      : scope.lectures.map(function (id) { return 'L' + id; }).join(' ');
    return lectures + ' · ' + (scope.mode || 'mixed');
  }

  function renderFlash(mount) {
    if (!flash) return;
    mount.appendChild(el('p', 'flash is-' + flash.kind, flash.text));
    flash = null;
  }

  function renderTrend(mount, attempts) {
    mount.appendChild(el('h3', 'field-label', 'Attempts'));

    if (attempts.length === 0) {
      mount.appendChild(el('p', 'empty', 'No attempts yet. Take a quiz and it will show up here.'));
      return;
    }

    var list = el('div', 'trend');
    attempts.slice().reverse().forEach(function (attempt) {
      var pct = attempt.total === 0 ? 0 : Math.round(attempt.correct / attempt.total * 100);

      var row = el('div', 'trend-row');
      var meta = el('div', 'trend-meta');
      meta.appendChild(el('span', 'trend-date', formatDate(attempt.at)));
      meta.appendChild(el('span', 'trend-scope', scopeLabel(attempt.scope)));
      row.appendChild(meta);

      var track = el('span', 'breakdown-track');
      var fill = el('span', 'breakdown-fill');
      fill.style.width = pct + '%';
      if (pct < 50) fill.classList.add('is-bad');
      else if (pct < 80) fill.classList.add('is-mid');
      track.appendChild(fill);
      row.appendChild(track);

      row.appendChild(el('span', 'breakdown-num', attempt.correct + '/' + attempt.total));
      list.appendChild(row);
    });
    mount.appendChild(list);
  }

  function renderAccuracy(mount, title, buckets, labelFor, emptyText) {
    mount.appendChild(el('h3', 'field-label', title));

    var keys = Object.keys(buckets);
    if (keys.length === 0) {
      mount.appendChild(el('p', 'empty', emptyText));
      return;
    }

    var table = el('div', 'breakdown');
    keys.sort(function (a, b) {
      return (buckets[a].correct / buckets[a].total) - (buckets[b].correct / buckets[b].total);
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

      row.appendChild(el('span', 'breakdown-num', bucket.correct + '/' + bucket.total));
      table.appendChild(row);
    });
    mount.appendChild(table);
  }

  function download(text, filename) {
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke on the next tick; revoking synchronously can cancel the download.
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function renderActions(mount) {
    mount.appendChild(el('h3', 'field-label', 'Move progress between devices'));
    mount.appendChild(
      el('p', 'field-note', 'Progress lives in this browser only. Export here, import on the other device.')
    );

    mount.appendChild(button('btn', 'Export progress', function () {
      var stamp = new Date().toISOString().slice(0, 10);
      download(App.store.exportJSON(), 'ap-exam-prep-progress-' + stamp + '.json');
    }));

    var picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'application/json,.json';
    picker.className = 'visually-hidden';
    picker.addEventListener('change', function () {
      var file = picker.files && picker.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function () {
        try {
          var result = App.store.importJSON(String(reader.result));
          flash = {
            kind: 'ok',
            text: 'Imported ' + result.added +
              (result.added === 1 ? ' attempt' : ' attempts') +
              (result.skipped ? ', skipped ' + result.skipped + ' already present' : '') + '.'
          };
        } catch (err) {
          flash = { kind: 'bad', text: err.message };
        }
        picker.value = '';   // so re-picking the same file fires change again
        App.render();
      };
      reader.onerror = function () {
        flash = { kind: 'bad', text: 'That file could not be read.' };
        picker.value = '';
        App.render();
      };
      reader.readAsText(file);
    });
    mount.appendChild(picker);

    mount.appendChild(button('btn', 'Import progress', function () { picker.click(); }));

    mount.appendChild(el('h3', 'field-label', 'Danger zone'));
    mount.appendChild(button('btn btn-bad', 'Reset all progress', function () {
      var ok = window.confirm(
        'Delete every recorded attempt in this browser? This cannot be undone. ' +
        'Export first if you want to keep it.'
      );
      if (!ok) return;
      App.store.reset();
      flash = { kind: 'ok', text: 'Progress cleared.' };
      App.render();
    }));
  }

  function lectureLabel(id) {
    var lecture = LECTURES.filter(function (l) { return String(l.id) === String(id); })[0];
    return lecture ? 'L' + lecture.id + ' ' + lecture.shortName : 'L' + id;
  }

  function render(mount) {
    mount.appendChild(el('h2', 'screen-title', 'Progress'));
    renderFlash(mount);

    if (!App.store.isPersistent()) {
      mount.appendChild(
        el('p', 'notice', 'Storage is unavailable in this browser, so nothing here will survive a reload.')
      );
    }

    var attempts = App.store.attempts();

    if (attempts.length > 0) {
      var totalQuestions = 0;
      var totalCorrect = 0;
      attempts.forEach(function (attempt) {
        totalQuestions += attempt.total;
        totalCorrect += attempt.correct;
      });
      mount.appendChild(el('p', 'big-score', totalCorrect + ' / ' + totalQuestions));
      mount.appendChild(
        el('p', 'field-note', attempts.length + (attempts.length === 1 ? ' attempt' : ' attempts') + ' recorded')
      );
    }

    renderAccuracy(
      mount, 'Accuracy by topic', App.store.topicAccuracy(),
      function (key) { return key; },
      'Take a quiz to build a topic breakdown — this is the list that tells you what to study next.'
    );
    renderAccuracy(
      mount, 'Accuracy by lecture', App.store.lectureAccuracy(), lectureLabel,
      'No lecture data yet.'
    );
    renderTrend(mount, attempts);
    renderActions(mount);
  }

  App.register('progress', { render: render });
})();
