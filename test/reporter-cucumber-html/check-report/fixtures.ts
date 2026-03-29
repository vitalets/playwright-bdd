import { pathToFileURL } from 'node:url';
import { test as base, type Page } from '@playwright/test';
import { HtmlReport } from './poms/HtmlReport';
import { Feature } from './poms/Feature';
import { Scenario } from './poms/Scenario';
import path from 'node:path';

type Fixtures = {
  htmlReport: HtmlReport;
  feature: Feature;
  scenario: Scenario;
};

type WorkerFixtures = {
  reportPage: Page;
};

export const test = base.extend<Fixtures, WorkerFixtures>({
  reportPage: [
    async ({ browser }, use) => {
      // Reuse one loaded report per worker to avoid re-parsing the large static HTML for every test.
      const context = await browser.newContext({
        viewport: { width: 800, height: 720 },
      });
      const page = await context.newPage();
      await page.goto(pathToFileURL('actual-reports/report.html').href);
      await use(page);
      await context.close();
    },
    { scope: 'worker' },
  ],
  htmlReport: async ({ reportPage }, use) => {
    await use(new HtmlReport(reportPage));
  },
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
