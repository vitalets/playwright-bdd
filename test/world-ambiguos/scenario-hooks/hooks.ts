import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Before } = createBdd(test, { worldFixture: 'world2' });

Before(async function () {});
