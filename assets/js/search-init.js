(function () {
  var searchInstance = null;

  function initSearch() {
    var searchInput = document.getElementById('search-input');
    var resultsContainer = document.getElementById('results-container');
    if (!searchInput || !resultsContainer || typeof SimpleJekyllSearch === 'undefined') return;
    if (searchInput.dataset.searchReady === 'true') return;

    var jsonUrl = searchInput.getAttribute('data-search-json') || '/search.json';
    var urlParams = new URLSearchParams(window.location.search);
    var query = (urlParams.get('q') || '').trim();

    if (query) searchInput.value = query;

    searchInstance = SimpleJekyllSearch({
      searchInput: searchInput,
      resultsContainer: resultsContainer,
      json: jsonUrl,
      searchResultTemplate:
        '<li><a href="{url}">{title}</a><span class="search-result-meta">{date}</span></li>',
      noResultsText: '검색결과가 존재하지 않습니다.',
      limit: 50,
      fuzzy: false,
      success: function () {
        if (query && this.search) this.search(query);
      }
    });

    searchInput.dataset.searchReady = 'true';
  }

  function boot() {
    if (typeof SimpleJekyllSearch === 'undefined') {
      setTimeout(boot, 50);
      return;
    }
    initSearch();
  }

  document.addEventListener('DOMContentLoaded', boot);
  var pushStateEl = document.getElementById('_pushState') || document.querySelector('hy-push-state');
  if (pushStateEl) {
    pushStateEl.addEventListener('hy-push-state-after', function () {
      var input = document.getElementById('search-input');
      if (input) input.dataset.searchReady = '';
      boot();
    });
  }
})();
