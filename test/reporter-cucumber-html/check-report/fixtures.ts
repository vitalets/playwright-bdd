import { pathToFileURL } from 'node:url';
import { test as base } from '@playwright/test';
import { HtmlReport } from './poms/HtmlReport';
import { Feature } from './poms/Feature';
import { Scenario } from './poms/Scenario';
import path from 'node:path';

type Fixtures = {
  htmlReport: HtmlReport;
  feature: Feature;
  scenario: Scenario;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await page.goto(pathToFileURL('actual-reports/report.html').href);
    await use(page);
  },
  htmlReport: async ({ page }, use) => use(new HtmlReport(page)),
  feature: async ({ htmlReport }, use, testInfo) => {
    const featureUri = getFeatureUriFromTestFile(testInfo.file);
    const feature = htmlReport.getFeature(featureUri);
    await feature.ensureExpanded();
    await use(feature);
  },
  scenario: async ({ feature }, use, testInfo) => {
    await use(feature.getScenario(testInfo.title));
  },
});

function getFeatureUriFromTestFile(file: string) {
  const featureFilename = path.basename(file).replace(/\.spec\.ts$/, '');
  const featureDir = path.resolve(path.dirname(file), '..');
  const featurePath = path.join(featureDir, featureFilename);
  return path.relative(process.cwd(), featurePath);
}
