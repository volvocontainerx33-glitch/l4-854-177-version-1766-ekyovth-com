(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var activeFilter = "";

    if (!input || !cards.length) {
      return;
    }

    function getQueryFromUrl() {
      try {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
      } catch (error) {
        return "";
      }
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-text")).toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
        var shouldShow = matchQuery && matchFilter;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = chip.getAttribute("data-filter") || "";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        apply();
      });
    });

    input.value = getQueryFromUrl();
    input.addEventListener("input", apply);
    apply();
  }

  function mountPlayer(streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player]");
      var overlay = document.querySelector("[data-play-overlay]");
      var hlsInstance = null;

      if (!video || !overlay || !streamUrl) {
        return;
      }

      function attachStream() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.getAttribute("src")) {
            video.setAttribute("src", streamUrl);
          }
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
          }
          return;
        }

        if (!video.getAttribute("src")) {
          video.setAttribute("src", streamUrl);
        }
      }

      function play() {
        attachStream();
        overlay.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });

  window.MovieSite = {
    mountPlayer: mountPlayer
  };
})();
