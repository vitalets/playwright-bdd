import { Given } from '@cucumber/cucumber';
import { createBdd } from 'playwright-bdd';

const { Before } = createBdd();

Before({ tags: '@skip' }, function () {
  this.testInfo.skip();
});

Given('a step that does not skip', function () {
  // no-op
});

Given('a step that is skipped', function () {
  // no-op
});

Given('I skip a step', function () {
  this.testInfo.skip();
});
