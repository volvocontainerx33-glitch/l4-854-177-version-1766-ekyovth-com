(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        var open = mobilePanel.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", open);
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });

    initHero();
    initFilters();
    initPlayer();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
        dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");

    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var select = panel.querySelector("[data-sort-select]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-tag-filter]"));
      var targetSelector = panel.getAttribute("data-target") || "[data-card-grid]";
      var grid = document.querySelector(targetSelector);
      var resultLine = panel.querySelector("[data-result-line]");
      var emptyState = document.querySelector(panel.getAttribute("data-empty") || "[data-empty-state]");
      var activeTag = "";

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

      function applyQueryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && input) {
          input.value = q;
        }
      }

      function matches(card, query) {
        var haystack = normalize(card.getAttribute("data-search"));
        var tags = normalize(card.getAttribute("data-tags"));
        var queryOk = !query || haystack.indexOf(query) !== -1;
        var tagOk = !activeTag || tags.indexOf(normalize(activeTag)) !== -1;
        return queryOk && tagOk;
      }

      function sortCards(visibleCards) {
        var mode = select ? select.value : "default";
        var sorted = visibleCards.slice();

        sorted.sort(function (a, b) {
          if (mode === "year-asc") {
            return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
          }
          if (mode === "title") {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
          }
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });

        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function update() {
        var query = normalize(input ? input.value : "");
        var visibleCards = [];

        cards.forEach(function (card) {
          var visible = matches(card, query);
          card.hidden = !visible;
          if (visible) {
            visibleCards.push(card);
          }
        });

        sortCards(visibleCards);

        if (resultLine) {
          if (query || activeTag) {
            resultLine.textContent = visibleCards.length ? "已匹配 " + visibleCards.length + " 部内容" : "没有匹配内容";
          } else {
            resultLine.textContent = "";
          }
        }

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visibleCards.length === 0);
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }

      if (select) {
        select.addEventListener("change", update);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeTag = button.getAttribute("data-tag-filter") || "";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          update();
        });
      });

      applyQueryFromUrl();
      update();
    });
  }

  function initPlayer() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-start-play]");
      var stream = player.getAttribute("data-stream");
      var bound = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function bind() {
        if (bound) {
          return;
        }
        bound = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function play() {
        bind();
        player.classList.add("is-started");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      video.addEventListener("click", function () {
        if (!bound) {
          play();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }
})();
