import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test, { worldFixture: 'world1' });

Given('step with world1', async function () {});
