import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('que abro la url {string}', async ({}, _url: string) => {
  // noop
});

When('hago clic en el enlace {string}', async function ({}, _text: string) {
  // noop
});

Then('veo en el título {string}', async function ({}, _title: string) {
  // noop
});
