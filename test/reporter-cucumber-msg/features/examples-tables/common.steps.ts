import assert from 'assert';
import { Given, When, Then } from '@cucumber/cucumber';

Given('there are {int} cucumbers', function (initialCount) {
  this.count = initialCount;
});

When('I eat {int} cucumbers', function (eatCount) {
  this.count -= eatCount;
});

Then('I should have {int} cucumbers', function (expectedCount) {
  assert.strictEqual(this.count, expectedCount);
});
