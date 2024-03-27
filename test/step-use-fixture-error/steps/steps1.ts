import { Given } from '@cucumber/cucumber';
import { BddWorld } from 'playwright-bdd';

Given<BddWorld>('State {int}', async function () {
  const fixtureName = 'foo';
  // error: this.useFixture() should accept static string, not variable
  this.useFixture(fixtureName);
});
