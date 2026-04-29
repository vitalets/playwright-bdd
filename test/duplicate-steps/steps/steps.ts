import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('unique step', async ({}) => {});
Given('duplicate step', async ({}) => {});
Given('duplicate step', async ({}) => {});
Given(/duplicate step/, async ({}) => {});
Given('duplicate tagged step', { tags: '@duplicate-tagged-steps' }, async ({}) => {});
Given('duplicate tagged step', { tags: '@duplicate-tagged-steps' }, async ({}) => {});
