import { When, Before, After, BeforeAll, AfterAll, isPlaywrightRun } from '../fixtures';
import fs from 'fs';

BeforeAll({}, function () {
  // no-op
});

Before({}, function () {
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

After({}, function () {
  // no-op
});

After({ name: 'after 2', tags: '@some-tag or @some-other-tag' }, function () {
  throw new Error('Exception in conditional hook');
});

After({ name: 'after 3', tags: '@with-attachment' }, async function () {
  if (isPlaywrightRun) {
    await this.testInfo.attach('', {
      path: __dirname + '/cucumber.svg',
      contentType: 'image/svg+xml',
    });
  } else {
    await this.attach(fs.createReadStream(__dirname + '/cucumber.svg'), 'image/svg+xml');
  }
});

// This hook does not exist in messages,
// because for AfterAll hooks we report to messages only hooks that have error.
AfterAll({}, async function () {
  // no-op
});
