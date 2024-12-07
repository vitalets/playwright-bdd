import { pathToFileURL } from 'node:url';
import { test as base } from '@playwright/test';
import { HtmlReport } from './poms/HtmlReport';
import { Feature } from './poms/Feature';
import { Scenario } from './poms/Scenario';

type Fixtures = {
  htmlReport: HtmlReport;
  featureUri: string;
  feature: Feature;
  scenario: Scenario;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await page.goto(pathToFileURL('actual-reports/report.html').href);
    await use(page);
  },
  htmlReport: async ({ page }, use) => use(new HtmlReport(page)),
  featureUri: ['', { option: true }], // will be overwritten in test files
  feature: async ({ htmlReport, featureUri }, use) => {
    if (!featureUri) throw new Error('Missing featureUri');
    await use(htmlReport.getFeature(featureUri));
  },
  scenario: async ({ feature }, use, testInfo) => {
    await use(feature.getScenario(testInfo.title));
  },
});
