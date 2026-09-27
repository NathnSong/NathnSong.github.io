(function () {
  var searchInstance = null;
  var searchRequestId = 0;

  function initSearch() {
    var searchInput = document.getElementById('search-input');
    var resultsContainer = document.getElementById('results-container');
    if (!searchInput || !resultsContainer || typeof SimpleJekyllSearch === 'undefined') return;
    if (searchInput.dataset.searchReady === 'true') return;

    var jsonUrl = searchInput.getAttribute('data-search-json') || '/search.json';
    var urlParams = new URLSearchParams(window.location.search);
    var query = (urlParams.get('q') || '').trim();

    if (query) searchInput.value = query;

    searchInput.dataset.searchReady = 'true';
    var requestId = ++searchRequestId;

    // simple-jekyll-search calls `success` before a URL index finishes loading,
    // so an initial query would run against an empty index and show "no results".
    fetch(jsonUrl, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('search json ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (requestId !== searchRequestId) return;
        if (!document.body.contains(searchInput) || !document.body.contains(resultsContainer)) return;

        searchInstance = SimpleJekyllSearch({
          searchInput: searchInput,
          resultsContainer: resultsContainer,
          json: data,
          searchResultTemplate:
            '<li><a href="{url}">{title}</a><span class="search-result-meta">{date}</span></li>',
          noResultsText: '검색결과가 존재하지 않습니다.',
          limit: 50,
          fuzzy: false
        });

        var current = (searchInput.value || '').trim();
        if (current && searchInstance && typeof searchInstance.search === 'function') {
          searchInstance.search(current);
        }
      })
      .catch(function () {
        if (requestId !== searchRequestId) return;
        if (document.body.contains(searchInput)) searchInput.dataset.searchReady = '';
      });
  }

  function boot() {
    if (typeof SimpleJekyllSearch === 'undefined') {
      setTimeout(boot, 50);
      return;
    }
    initSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  var pushStateEl = document.getElementById('_pushState') || document.querySelector('hy-push-state');
  if (pushStateEl && pushStateEl.dataset.searchBootBound !== 'true') {
    pushStateEl.dataset.searchBootBound = 'true';
    pushStateEl.addEventListener('hy-push-state-after', function () {
      var input = document.getElementById('search-input');
      if (input) input.dataset.searchReady = '';
      boot();
    });
  }
})();
