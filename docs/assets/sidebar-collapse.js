(function () {
  const openItems = new Set();
  const closedItems = new Set();

  function sidebarCollapse(hook) {
    hook.doneEach(applySidebarState);
    hook.ready(function () {
      const sidebar = document.querySelector('.sidebar-nav');
      if (sidebar) sidebar.addEventListener('click', handleSidebarClick);
      applySidebarState();
    });
  }

  function handleSidebarClick(event) {
    const label = event.target.closest('.sidebar-folder > strong, .sidebar-folder > p > strong');
    if (!label) return;

    const item = label.closest('.sidebar-folder');
    const key = getItemKey(item);
    if (item.classList.contains('open')) {
      item.classList.remove('open');
      openItems.delete(key);
      closedItems.add(key);
    } else {
      item.classList.add('open');
      openItems.add(key);
      closedItems.delete(key);
    }
  }

  function applySidebarState() {
    document.querySelectorAll('.sidebar-nav li').forEach((item) => {
      const childList = item.querySelector(':scope > ul');
      const label = item.querySelector(':scope > p > strong, :scope > strong');
      if (!childList || !label) return;

      item.classList.add('sidebar-folder');
      const key = getItemKey(item);
      const shouldOpen = hasActiveChild(item) || openItems.has(key);

      item.classList.toggle('open', shouldOpen);
    });
  }

  function hasActiveChild(item) {
    return Boolean(item.querySelector(':scope a.active, :scope li.active'));
  }

  function getItemKey(item) {
    const indexes = [];
    let current = item;
    while (current && current.classList && !current.classList.contains('sidebar-nav')) {
      if (current.tagName === 'LI') {
        indexes.unshift(Array.from(current.parentElement.children).indexOf(current));
      }
      current = current.parentElement;
    }
    return indexes.join('.');
  }

  window.$docsify.plugins = [sidebarCollapse].concat(window.$docsify.plugins || []);
})();
