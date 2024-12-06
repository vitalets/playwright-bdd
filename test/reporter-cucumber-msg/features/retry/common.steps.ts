import { Given, isPlaywrightRun } from '../fixtures';

Given('a step that always passes', function () {
  // no-op
});

// keep this global to store counter between retries
let secondTimePass = 0;
Given('a step that passes the second time', function () {
  if (isPlaywrightRun) {
    if (this.testInfo.retry < 1) {
      throw new Error('Exception in step');
    }
  } else {
    secondTimePass++;
    if (secondTimePass < 2) {
      throw new Error('Exception in step');
    }
  }
});

let thirdTimePass = 0;
Given('a step that passes the third time', function () {
  if (isPlaywrightRun) {
    if (this.testInfo.retry < 2) {
      throw new Error('Exception in step');
    }
  } else {
    thirdTimePass++;
    if (thirdTimePass < 3) {
      throw new Error('Exception in step');
    }
  }
});

Given('a step that always fails', function () {
  throw new Error('Exception in step');
});
