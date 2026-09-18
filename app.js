// Boot, routing and view mounting. No business logic lives here.
var App = (function () {
  'use strict';

  var APP_VIEWS = {};
  var mount = null;
  var store = null;

  function safeStorage() {
    try {
      return window.localStorage;
    } catch (err) {
      // Safari in private mode throws on property access, not just on use.
      return null;
    }
  }

  function setActiveTab(view) {
    var tabs = document.querySelectorAll('.tab');
    Array.prototype.forEach.call(tabs, function (tab) {
      if (tab.getAttribute('data-view') === view) {
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.removeAttribute('aria-current');
      }
    });
  }

  function render() {
    var route = Router.parse(window.location.hash);
    var view = APP_VIEWS[route.view];

    setActiveTab(route.view);
    mount.innerHTML = '';

    if (!view) {
      var missing = document.createElement('p');
      missing.className = 'empty';
      missing.textContent = 'This view is not available.';
      mount.appendChild(missing);
      return;
    }

    // Reset scroll BEFORE rendering: a view may scroll a deep-linked item into
    // view during its own render, and resetting afterwards would undo it.
    mount.scrollTop = 0;
    window.scrollTo(0, 0);

    view.render(mount, route.param);
  }

  function go(view, param) {
    var next = Router.format(view, param);
    if (window.location.hash === next) {
      render();   // same hash fires no hashchange, so re-render by hand
    } else {
      window.location.hash = next;
    }
  }

  function register(name, view) {
    APP_VIEWS[name] = view;
  }

  function boot() {
    mount = document.getElementById('main');
    store = ProgressStore.create(safeStorage());

    if (!store.isPersistent()) {
      var notice = document.createElement('p');
      notice.className = 'notice';
      notice.textContent =
        'Storage is unavailable, so progress will be kept for this session only.';
      document.querySelector('.topbar').appendChild(notice);
    }

    window.addEventListener('hashchange', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', boot);

  return {
    register: register,
    go: go,
    render: render,
    views: APP_VIEWS,
    get store() { return store; }
  };
})();
