import { createBdd } from 'playwright-bdd';
import { testWithLog } from '../../_helpers/withLog';

export const test = testWithLog;

export const { Given, Before, BeforeAll, After, AfterAll } = createBdd(test);
