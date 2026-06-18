(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const setSlide = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });

    window.setInterval(function () {
      setSlide(index + 1);
    }, 5600);
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const filterPanels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  filterPanels.forEach(function (panel) {
    const root = panel.closest('section') || document;
    const input = panel.querySelector('[data-filter-input]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const cards = Array.from(root.querySelectorAll('[data-card]'));

    if (input && query) {
      input.value = query;
    }

    const apply = function () {
      const q = input ? input.value.trim().toLowerCase() : '';
      const y = year ? year.value : '';
      const t = type ? type.value : '';

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || '',
          card.dataset.genre || '',
          card.dataset.tags || ''
        ].join(' ').toLowerCase();

        const okText = !q || haystack.indexOf(q) !== -1;
        const okYear = !y || (card.dataset.year || '') === y;
        const okType = !t || (card.dataset.type || '').indexOf(t) !== -1 || (card.dataset.genre || '').indexOf(t) !== -1;

        card.classList.toggle('hidden', !(okText && okYear && okType));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (type) {
      type.addEventListener('change', apply);
    }
    apply();
  });
})();
