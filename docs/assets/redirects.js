// Docsify aliases load another page's content but keep the old URL in the address bar.
// These redirects update the URL to the canonical release-notes path while preserving
// section links and avoiding an extra browser history entry.
(function () {
  const redirects = {
    '/guides/migration-v7': '/release-notes/v7',
    '/blog/whats-new-in-v8': '/release-notes/v8',
    '/guides/migration-v9': '/release-notes/v9',
  };

  function redirect() {
    const hash = window.location.hash.slice(1);
    const queryIndex = hash.indexOf('?');
    const pathname = queryIndex === -1 ? hash : hash.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : hash.slice(queryIndex);
    const target = redirects[pathname.replace(/\.md$/, '')];
    if (!target) return;

    // Preserve Docsify's ?id= section links and avoid adding a back-button stop.
    window.history.replaceState(window.history.state, '', '#' + target + query);
  }

  // Run before Docsify starts, and before its handler on subsequent navigation.
  redirect();
  window.addEventListener('hashchange', redirect);
})();
