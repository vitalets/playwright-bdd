import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test, { worldFixture: 'world2' });

Given('step with world2', async function () {});
