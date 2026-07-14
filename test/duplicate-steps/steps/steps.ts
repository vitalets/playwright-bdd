import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('unique step', async ({}) => {});
Given('duplicate step', async ({}) => {});
Given('duplicate step', async ({}) => {});
Given(/duplicate step/, async ({}) => {});
Given(['duplicate step with aliases', /duplicate step with aliases/], async ({}) => {});
Given('duplicate step with aliases', async ({}) => {});
Given('duplicate tagged step', { tags: '@duplicate-tagged-steps' }, async ({}) => {});
Given('duplicate tagged step', { tags: '@duplicate-tagged-steps' }, async ({}) => {});
