(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length === 0) {
      return;
    }

    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupCardFiltering() {
    var container = document.querySelector("[data-card-container]");
    var input = document.querySelector("[data-card-filter]");
    var sort = document.querySelector("[data-sort-select]");
    var count = document.querySelector("[data-card-count]");
    if (!container) {
      return;
    }

    var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));

    function textOf(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var ok = query === "" || textOf(card).indexOf(query) !== -1;
        card.classList.toggle("is-filtered-out", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + " 部";
      }
    }

    function applySort() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards.slice();
      sorted.sort(function (a, b) {
        var ay = Number(a.getAttribute("data-year")) || 0;
        var by = Number(b.getAttribute("data-year")) || 0;
        var as = Number(a.getAttribute("data-score")) || 0;
        var bs = Number(b.getAttribute("data-score")) || 0;
        var at = a.getAttribute("data-title") || "";
        var bt = b.getAttribute("data-title") || "";
        var ao = Number(a.getAttribute("data-order")) || 0;
        var bo = Number(b.getAttribute("data-order")) || 0;

        if (value === "newest") {
          return by - ay || bs - as;
        }
        if (value === "oldest") {
          return ay - by || as - bs;
        }
        if (value === "hot") {
          return bs - as || by - ay;
        }
        if (value === "title") {
          return at.localeCompare(bt, "zh-Hans-CN");
        }
        return ao - bo;
      });
      sorted.forEach(function (card) {
        container.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (sort) {
      sort.addEventListener("change", applySort);
    }
    applyFilter();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    var status = document.getElementById("searchStatus");
    if (!results || !input || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var keyword = query.trim().toLowerCase();
      results.innerHTML = "";

      if (!keyword) {
        status.textContent = "请输入关键词或通过顶部搜索框进入。";
        return;
      }

      var found = window.SEARCH_INDEX.filter(function (item) {
        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 300);

      status.textContent = "找到 " + found.length + " 条相关结果" + (found.length === 300 ? "（显示前 300 条）" : "");

      results.innerHTML = found.map(function (item) {
        return "" +
          "<article class=\"movie-card\">" +
          "<a class=\"movie-card-link\" href=\"" + escapeHtml(item.url) + "\">" +
          "<figure class=\"movie-cover-wrap\">" +
          "<img class=\"movie-cover\" src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
          "<span class=\"year-pill\">" + escapeHtml(item.year) + "</span>" +
          "<span class=\"region-pill\">" + escapeHtml(item.region) + "</span>" +
          "</figure>" +
          "<div class=\"movie-card-body\">" +
          "<h3>" + escapeHtml(item.title) + "</h3>" +
          "<p>" + escapeHtml(item.oneLine) + "</p>" +
          "<div class=\"movie-meta-row\"><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.tag) + "</span></div>" +
          "</div>" +
          "</a>" +
          "</article>";
      }).join("");
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupCardFiltering();
    setupSearchPage();
  });
})();
