
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = 'search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function applyLocalFilter(input) {
    var root = input.closest('section') || document;
    var grid = root.querySelector('[data-search-grid]');
    var empty = root.querySelector('[data-empty-state]');
    if (!grid) {
      return;
    }
    var query = normalize(input.value);
    var visible = 0;
    grid.querySelectorAll('.movie-card').forEach(function (card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.year
      ].join(' '));
      var matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  function setupFilters() {
    document.querySelectorAll('[data-local-filter]').forEach(function (input) {
      input.addEventListener('input', function () {
        applyLocalFilter(input);
      });
    });
    document.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var section = chip.closest('section') || document;
        var input = section.querySelector('[data-local-filter]');
        if (input) {
          input.value = chip.dataset.filterChip || chip.textContent.trim();
          applyLocalFilter(input);
        }
      });
    });
    var queryInput = document.querySelector('[data-query-input]');
    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        queryInput.value = q;
        applyLocalFilter(queryInput);
      }
    }
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    start();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (container) {
      var source = container.dataset.source;
      var video = container.querySelector('video');
      var overlay = container.querySelector('[data-play-button]');
      var hls = null;
      var attached = false;
      var manifestReady = false;

      if (!source || !video) {
        return;
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }

      function safePlay() {
        hideOverlay();
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            manifestReady = true;
            safePlay();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          manifestReady = true;
        } else {
          video.src = source;
          manifestReady = true;
        }
      }

      function play() {
        attachSource();
        if (manifestReady || !window.Hls || !window.Hls.isSupported()) {
          safePlay();
        } else {
          hideOverlay();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', hideOverlay);
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
