import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('Unique step of project one', async () => {});
Given('Step defined in both projects', async () => {});
