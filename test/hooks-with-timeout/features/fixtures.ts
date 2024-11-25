import { test as base, createBdd } from 'playwright-bdd';
import { withLog } from '../../_helpers/withLog';

export const test = withLog(base);

export const { Given, Before, BeforeAll, After, AfterAll } = createBdd(test);
