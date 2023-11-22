import { Given } from '@cucumber/cucumber';
import { BddWorld } from '../../dist';

Given<BddWorld>('State {int}', async function () {
  const fixtureName = 'foo';
  // error: this.useFixture() should accept static string, not variable
  this.useFixture(fixtureName);
});
