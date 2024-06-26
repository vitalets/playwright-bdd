import { When, Before, After } from '../fixtures';

// add name to all hooks, b/c in playwright-bdd we add to report only named hooks

Before({ name: 'before 1' }, function () {
  // no-op
});

Before({ name: 'A named hook' }, function () {
  // no-op
});

When('a step passes', function () {
  // no-op
});

When('a step fails', function () {
  throw new Error('Exception in step');
});

After({ name: 'after 1' }, function () {
  // no-op
});

After({ name: 'after 2', tags: '@some-tag or @some-other-tag' }, function () {
  throw new Error('Exception in conditional hook');
});

After({ name: 'after 3', tags: '@with-attachment' }, async function () {
  await this.testInfo.attach('', {
    path: __dirname + '/cucumber.svg',
    contentType: 'image/svg+xml',
  });
});
