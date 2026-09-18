// Reference Bank: lecture nav, collapsible sections, search, cross-cutting tab.
(function () {
  'use strict';

  var TYPE_LABELS = {
    definition: 'Definition',
    formula: 'Formula',
    distinction: 'Distinction',
    fact: 'Fact',
    pitfall: 'Watch out'
  };

  var state = { tab: 'lectures', lectureId: null, queryText: '' };
  var searchIndex = null;

  function index() {
    if (!searchIndex) searchIndex = Search.build(ContentIndex.flatten(LECTURES));
    return searchIndex;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderFormula(latex) {
    var holder = el('div', 'item-formula-render');
    try {
      holder.innerHTML = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true
      });
    } catch (err) {
      holder.textContent = latex;   // never leave the user with nothing
    }
    return holder;
  }

  function itemCard(item, opts) {
    var options = opts || {};
    var card = el('article', 'item item-' + item.type);
    card.id = 'item-' + item.id;

    var head = el('div', 'item-head');
    head.appendChild(el('span', 'item-type', TYPE_LABELS[item.type] || item.type));
    if (options.showLecture) {
      head.appendChild(el('span', 'item-origin', 'L' + item.lectureId));
    }
    card.appendChild(head);

    card.appendChild(el('h3', 'item-term', item.term));
    card.appendChild(el('p', 'item-body', item.body));

    if (item.formula) {
      card.appendChild(renderFormula(item.formula));
      if (item.symbols) card.appendChild(el('p', 'item-symbols', item.symbols));
    }

    if (item.crossRef && item.crossRef.length) {
      var refs = el('div', 'item-refs');
      item.crossRef.forEach(function (key) {
        var group = CROSS_CUTTING.filter(function (g) { return g.key === key; })[0];
        if (!group) return;
        var link = el('button', 'chip', 'Also: ' + group.title);
        link.type = 'button';
        link.addEventListener('click', function () {
          state.tab = 'cross';
          state.crossKey = key;
          App.go('reference', null);
        });
        refs.appendChild(link);
      });
      card.appendChild(refs);
    }

    return card;
  }

  function renderTabs(mount) {
    var tabs = el('div', 'subtabs');
    [
      { key: 'lectures', label: 'Lectures' },
      { key: 'cross', label: 'Cross-cutting' }
    ].forEach(function (tab) {
      var button = el('button', 'subtab' + (state.tab === tab.key ? ' is-active' : ''), tab.label);
      button.type = 'button';
      button.addEventListener('click', function () {
        state.tab = tab.key;
        // Drop the deep-link param: App.render() re-reads the hash, and a
        // lingering param would overwrite the tab we just selected.
        App.go('reference', null);
      });
      tabs.appendChild(button);
    });
    mount.appendChild(tabs);
  }

  function renderSearch(mount) {
    var wrap = el('div', 'searchbar');
    var input = el('input', 'search-input');
    input.type = 'search';
    input.placeholder = 'Search all lectures…';
    input.value = state.queryText;
    input.setAttribute('aria-label', 'Search the reference bank');

    var results = el('div', 'search-results');

    function update() {
      state.queryText = input.value;

      var listing = mount.querySelector('.lecture-listing');
      if (listing) listing.hidden = state.queryText.trim() !== '';

      results.innerHTML = '';
      var hits = Search.query(index(), state.queryText);

      if (!state.queryText.trim()) return;

      if (hits.length === 0) {
        results.appendChild(el('p', 'empty', 'No matches.'));
        return;
      }
      results.appendChild(
        el('p', 'search-count', hits.length + (hits.length === 1 ? ' match' : ' matches'))
      );
      hits.slice(0, 50).forEach(function (item) {
        results.appendChild(itemCard(item, { showLecture: true }));
      });
    }

    input.addEventListener('input', update);
    wrap.appendChild(input);
    mount.appendChild(wrap);
    mount.appendChild(results);
    update();

    return function isSearching() { return state.queryText.trim() !== ''; };
  }

  function renderLectureNav(mount) {
    var nav = el('nav', 'lecture-nav');
    nav.setAttribute('aria-label', 'Lectures');

    LECTURES.slice()
      .sort(function (a, b) { return a.id - b.id; })
      .forEach(function (lecture) {
        var active = state.lectureId === lecture.id;
        var button = el('button', 'lecture-pill' + (active ? ' is-active' : ''));
        button.type = 'button';
        button.appendChild(el('span', 'lecture-pill-num', 'L' + lecture.id));
        button.appendChild(el('span', 'lecture-pill-name', lecture.shortName));
        button.addEventListener('click', function () {
          state.lectureId = active ? null : lecture.id;
          App.go('reference', null);   // see the note in renderTabs
        });
        nav.appendChild(button);
      });

    mount.appendChild(nav);
  }

  function renderLecture(mount, lecture, openItemId) {
    mount.appendChild(el('h2', 'lecture-title', lecture.name));

    lecture.sections.forEach(function (section, sectionIndex) {
      var details = el('details', 'section');
      var containsTarget = openItemId && section.items.some(function (item) {
        return item.id === openItemId;
      });
      // First section open by default so the page is never a wall of closed rows.
      details.open = containsTarget || sectionIndex === 0;

      var summary = el('summary', 'section-summary');
      summary.appendChild(el('span', 'section-heading', section.heading));
      summary.appendChild(el('span', 'section-count', String(section.items.length)));
      details.appendChild(summary);

      section.items.forEach(function (item) {
        details.appendChild(itemCard(item, {}));
      });

      mount.appendChild(details);
    });
  }

  function renderCrossCutting(mount) {
    CROSS_CUTTING.forEach(function (group) {
      var section = el('section', 'cross-group');
      section.id = 'group-' + group.key;
      section.appendChild(el('h2', 'cross-title', group.title));
      section.appendChild(el('p', 'cross-blurb', group.blurb));

      var items = ContentIndex.byCrossRef(LECTURES, group.key);
      if (items.length === 0) {
        section.appendChild(el('p', 'empty', 'No items yet.'));
      } else {
        ContentIndex.groupByLecture(items).forEach(function (bucket) {
          section.appendChild(
            el('h3', 'cross-lecture', 'Lecture ' + bucket.lectureId + ' — ' + bucket.lectureShortName)
          );
          bucket.items.forEach(function (item) {
            section.appendChild(itemCard(item, {}));
          });
        });
      }
      mount.appendChild(section);
    });
  }

  function highlight(itemId) {
    var target = document.getElementById('item-' + itemId);
    if (!target) return;
    target.classList.add('is-target');
    target.scrollIntoView({ block: 'center' });
  }

  function render(mount, param) {
    // A deep link always lands on the lectures tab, showing that item's lecture.
    if (param) {
      var item = ContentIndex.byId(LECTURES).get(param);
      if (item) {
        state.tab = 'lectures';
        state.lectureId = item.lectureId;
        state.queryText = '';
      }
    }

    renderTabs(mount);

    if (state.tab === 'cross') {
      renderCrossCutting(mount);
      if (state.crossKey) {
        var group = document.getElementById('group-' + state.crossKey);
        if (group) group.scrollIntoView({ block: 'start' });
        state.crossKey = null;
      }
      return;
    }

    var isSearching = renderSearch(mount);

    var listing = el('div', 'lecture-listing');
    mount.appendChild(listing);
    // Built unconditionally so that clearing the search has something to
    // restore; typing only toggles `hidden`, never re-renders, so the search
    // input keeps focus and the caret.
    listing.hidden = isSearching();

    renderLectureNav(listing);

    var lectures = LECTURES.slice().sort(function (a, b) { return a.id - b.id; });
    if (state.lectureId == null) {
      if (lectures.length === 0) {
        listing.appendChild(el('p', 'empty', 'No content loaded.'));
        return;
      }
      state.lectureId = lectures[0].id;
    }

    var current = lectures.filter(function (l) { return l.id === state.lectureId; })[0];
    if (!current) {
      listing.appendChild(el('p', 'empty', 'That lecture is not loaded.'));
      return;
    }

    renderLecture(listing, current, param);
    if (param) highlight(param);
  }

  App.register('reference', { render: render });
})();
