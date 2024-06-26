import { Given } from '../fixtures';

Given('a step that always passes', function () {
  // no-op
});

Given('a step that passes the second time', function () {
  if (this.testInfo.retry < 1) {
    throw new Error('Exception in step');
  }
});

Given('a step that passes the third time', function () {
  if (this.testInfo.retry < 2) {
    throw new Error('Exception in step');
  }
});

Given('a step that always fails', function () {
  throw new Error('Exception in step');
});
