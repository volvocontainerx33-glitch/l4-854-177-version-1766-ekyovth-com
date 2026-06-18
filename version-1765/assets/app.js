(function () {
  var menuButton = document.querySelector('[data-mobile-menu]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  var filterGrid = document.querySelector('.js-filter-grid');
  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterGrid && filterPanel) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
    var textInput = filterPanel.querySelector('[data-filter-text]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var countNode = document.querySelector('[data-filter-count]');

    fillSelect(typeSelect, uniqueSorted(cards.map(function (card) { return card.dataset.type; })));
    fillSelect(regionSelect, uniqueSorted(cards.map(function (card) { return card.dataset.region; })));
    fillSelect(yearSelect, uniqueSorted(cards.map(function (card) { return card.dataset.year; })));

    function applyFilter() {
      var keyword = (textInput && textInput.value || '').trim().toLowerCase();
      var type = typeSelect && typeSelect.value;
      var region = regionSelect && regionSelect.value;
      var year = yearSelect && yearSelect.value;
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(' ').toLowerCase();

        var matched = true;
        matched = matched && (!keyword || haystack.indexOf(keyword) !== -1);
        matched = matched && (!type || card.dataset.type === type);
        matched = matched && (!region || card.dataset.region === region);
        matched = matched && (!year || card.dataset.year === year);

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visibleCount + ' / ' + cards.length + ' 部影片';
      }
    }

    [textInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilter();
      });
    }

    applyFilter();
  }
})();
