(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = !panel.hasAttribute("hidden");
      if (isOpen) {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero-carousel");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var section = panel.closest("section") || document;
      var grid = section.querySelector("[data-card-grid]");
      var input = panel.querySelector(".filter-input");
      var year = panel.querySelector(".year-filter");
      var type = panel.querySelector(".type-filter");
      var cards = grid ? Array.prototype.slice.call(grid.children) : [];
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var yearOk = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var typeOk = !selectedType || card.getAttribute("data-type") === selectedType;
          var textOk = !text || haystack.indexOf(text) !== -1;
          card.hidden = !(yearOk && typeOk && textOk);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (year) {
        year.addEventListener("change", apply);
      }

      if (type) {
        type.addEventListener("change", apply);
      }

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".watch-player"));

    players.forEach(function (video) {
      var frame = video.closest(".video-frame");
      var button = frame ? frame.querySelector(".video-start") : null;
      var url = video.getAttribute("data-video");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !url) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            maxBufferLength: 30
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }

        attached = true;
      }

      function startPlayback() {
        attach();

        if (frame) {
          frame.classList.add("is-playing");
        }

        if (button) {
          button.setAttribute("hidden", "");
        }

        var attempt = video.play();

        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            if (frame) {
              frame.classList.remove("is-playing");
            }

            if (button) {
              button.removeAttribute("hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener("play", function () {
        if (frame) {
          frame.classList.add("is-playing");
        }

        if (button) {
          button.setAttribute("hidden", "");
        }
      });

      video.addEventListener("ended", function () {
        if (button) {
          button.removeAttribute("hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }
})();
