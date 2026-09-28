import { createBdd } from 'playwright-bdd';
import { testWithLog } from '../../../_helpers/withLog';

export const test = testWithLog;

export const { Given, When, Then, Before, BeforeStep, AfterStep } = createBdd(test);
