import { mergeTests } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import { test as testWithTrack } from '../../_helpers/track';

export const test = mergeTests(base, testWithTrack);

export const { Given, Before, BeforeAll, After, AfterAll } = createBdd(test);
