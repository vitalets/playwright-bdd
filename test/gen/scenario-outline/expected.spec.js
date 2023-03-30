/** Generated from: sample.feature */
import { test } from 'playwright-bdd';

test.describe('Playwright site', () => {

  test('eating', async ({ Given, When, Then }) => {
    await When('I\'ve counted 2 times');
    await Then('You say doubled is 4');
  });

  test('eating (1)', async ({ Given, When, Then }) => {
    await When('I\'ve counted 3 times');
    await Then('You say doubled is 6');
  });

});