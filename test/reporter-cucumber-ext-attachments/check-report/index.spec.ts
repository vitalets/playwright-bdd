import { test, expect, Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';

for (const protocol of ['http', 'file'] as const) {
  test(`should show all attachments: ${protocol}`, async ({ page }) => {
    openHtmlReport(page, protocol);
    await expect(page.locator('summary')).toContainText([
      'plain text',
      'json text',
      'image as path',
      'image as buffer',
      'screenshot',
      'video',
    ]);

    await checkImageAttachment(page, 'image as path');
    await checkImageAttachment(page, 'image as buffer');
    await checkImageAttachment(page, 'screenshot');

    await checkDownloadTrace(page);
  });
}

test('should show trace viewer', async ({ page, context }) => {
  openHtmlReport(page, 'http');
  // open trace viewer
  await page.getByRole('link', { name: 'View trace' }).click();
  await expect(page).toHaveURL(/trace\/index\.html/);
  await expect(page.getByText('sample.feature.spec.js')).toContainText('some scenario');

  // open page snapshot
  const [traceViewerPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByLabel('Open snapshot').click(),
  ]);
  await expect(traceViewerPage.getByRole('heading')).toContainText('Example Domain');
});

async function openHtmlReport(page: Page, protocol: 'http' | 'file') {
  const url = protocol === 'http' ? '/' : pathToFileURL('actual-reports/index.html').href;
  await page.goto(url);
  await page.getByText('sample.feature').click();
}

async function checkImageAttachment(page: Page, name: string) {
  const imgAttachment = page.locator('details').filter({
    has: page.getByText(name),
  });
  await imgAttachment.click();
  await expect(imgAttachment.locator('img')).toBeVisible();
}

async function checkDownloadTrace(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5_000 }),
    page.getByText('Download trace').click(),
  ]);
  expect(download.suggestedFilename()).toContain('.zip');
}
