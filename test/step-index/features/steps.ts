import { createBdd } from 'playwright-bdd';
import { testWithLog } from '../../_helpers/withLog';

export const test = testWithLog;

const { Given } = createBdd(test);

Given('User sees the {string} field on the CatalogItem', ({ log }, field: string) => {
  log(`CatalogItem field: ${field}`);
});

Given('I read the CatalogItem payload:body{DocString}', { bddExpr: true }, ({ log }, body) => {
  log(`CatalogItem payload: ${body}`);
});
