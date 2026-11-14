import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test, { worldFixture: 'world' });

Given('Cucumber-style step with lock: lock3', { lock: 'lock3' }, function () {});
