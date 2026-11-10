(function () {
  const storageKey = 'playwright-bdd:dismissed-banner';

  function topBanner(hook, vm) {
    const content = vm.config.topBanner?.content;
    if (!content) return;
    if (isDismissed(content)) {
      // Disable rendering before the original plugin's ready hook to avoid a flash.
      vm.config.topBanner = false;
      return;
    }

    hook.ready(function () {
      const banner = document.getElementById('TOPBANNER');
      if (!banner) return;
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Announcement');

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'top-banner-close';
      closeButton.setAttribute('aria-label', 'Dismiss announcement');
      closeButton.textContent = '×';
      closeButton.addEventListener('click', function () {
        banner.remove();
        try {
          localStorage.setItem(storageKey, content);
        } catch {
          // Closing still works when browser settings prevent persistent storage.
        }
      });

      (banner.querySelector('p:last-child') || banner).append(closeButton);
    });
  }

  function isDismissed(content) {
    try {
      // Compare the source content so text or link changes show the announcement again.
      return localStorage.getItem(storageKey) === content;
    } catch {
      return false;
    }
  }

  // Run after the original plugin so its ready hook creates the banner first.
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(topBanner);
})();
