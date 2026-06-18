(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var list = document.querySelector("[data-filter-list]");
    var empty = document.querySelector("[data-no-results]");
    if (!list || (!input && !select)) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

    function apply() {
      var query = normalize(input ? input.value : "");
      var type = normalize(select ? select.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || ""));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !type || haystack.indexOf(type) !== -1;
        var show = matchQuery && matchType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function searchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card compact-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"play-badge\">▶</span>" +
      "</a>" +
      "<div class=\"movie-body\">" +
      "<div class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</div>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var empty = document.getElementById("searchEmpty");
    var picks = document.getElementById("searchPicks");
    if (!form || !input || !results || !window.movieSearchData) {
      return;
    }

    function run(query) {
      var value = normalize(query);
      var data = window.movieSearchData || [];
      var matched = value ? data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine,
          movie.category
        ].join(" "));
        return haystack.indexOf(value) !== -1;
      }).slice(0, 120) : [];
      results.innerHTML = matched.map(searchCard).join("");
      if (empty) {
        empty.hidden = matched.length !== 0 || !value;
      }
      if (picks) {
        picks.hidden = Boolean(value && matched.length);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    run(initial);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.history.replaceState(null, "", url);
      run(query);
    });

    input.addEventListener("input", function () {
      run(input.value);
    });
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
