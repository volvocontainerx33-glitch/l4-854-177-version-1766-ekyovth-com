(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var resultsNode = document.querySelector('[data-search-results]');
  var statusNode = document.querySelector('[data-search-status]');
  var movies = window.MOVIE_SEARCH_INDEX || [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '" class="movie-card-link">',
      '    <div class="poster-wrap">',
      '      <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + ' 在线观看封面" loading="lazy">',
      '      <span class="play-badge">▶</span>',
      '      <span class="poster-label">' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</p>',
      '      <p class="movie-genre">' + escapeHtml(movie.genre) + '</p>',
      '      <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '      <span class="movie-category">' + escapeHtml(movie.category) + '</span>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function runSearch(query) {
    var keyword = String(query || '').trim().toLowerCase();

    if (!keyword) {
      resultsNode.innerHTML = '';
      statusNode.textContent = '请输入关键词开始搜索。';
      return;
    }

    var terms = keyword.split(/\s+/).filter(Boolean);
    var matched = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine,
        movie.category
      ].join(' ').toLowerCase();

      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 120);

    statusNode.textContent = '找到 ' + matched.length + ' 条相关影片' + (matched.length === 120 ? '，已显示前 120 条。' : '。');
    resultsNode.innerHTML = matched.map(renderCard).join('\n');
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  if (input) {
    input.value = initialQuery;
  }

  runSearch(initialQuery);

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value : '';
      var url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.replaceState(null, '', url.toString());
      runSearch(query);
    });
  }
})();
