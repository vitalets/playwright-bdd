import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('unique step', async () => {});
Given('duplicate step', async () => {});
Given('duplicate step', async () => {});
Given(/duplicate step/, async () => {});
