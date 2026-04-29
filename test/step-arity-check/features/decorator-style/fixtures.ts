import { test as base } from 'playwright-bdd';
import { PageWithArityChecks } from './steps';

type Fixtures = {
  pageWithArityChecks: PageWithArityChecks;
};

export const test = base.extend<Fixtures>({
  pageWithArityChecks: ({}, use) => use(new PageWithArityChecks()),
});
