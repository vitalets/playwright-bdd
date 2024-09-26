import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTest(testDir.name);

  checkMessagesNoAttachments();
  checkJsonNoAttachments();
  checkJsonFilteredAttachments();
  checkHtmlFilteredAttachments();
});

function checkMessagesNoAttachments() {
  const report = testDir.getFileContents('actual-reports/no-attachments.ndjson');
  expect(report.includes('"fileName":"screenshot"')).toEqual(false);
  expect(report.includes('"fileName":"video"')).toEqual(false);
  expect(report.includes('"fileName":"trace"')).toEqual(false);
  expect(report.includes('"fileName":"ignored text"')).toEqual(false);
  expect(report.includes('"fileName":"regular text"')).toEqual(false);
}

function checkJsonNoAttachments() {
  const report = JSON.parse(testDir.getFileContents('actual-reports/no-attachments.json'));
  const scenario = report[0].elements[0];
  expect(scenario.steps[0].embeddings).toEqual(undefined);
  expect(scenario.steps[1].embeddings).toEqual(undefined);
  expect(scenario.steps[2].embeddings).toEqual(undefined);
}

function checkJsonFilteredAttachments() {
  const report = JSON.parse(testDir.getFileContents('actual-reports/filter-attachments.json'));
  const scenario = report[0].elements[0];
  expect(scenario.steps[0].embeddings[0].data).toBe(Buffer.from('foo').toString('base64'));
  expect(scenario.steps[1].embeddings).toEqual(undefined);
  expect(scenario.steps[2].embeddings).toEqual(undefined);
}

function checkHtmlFilteredAttachments() {
  const html = testDir.getFileContents('actual-reports/filter-attachments.html');
  expect(html.includes('"fileName":"screenshot"')).toEqual(false);
  expect(html.includes('"fileName":"video"')).toEqual(false);
  expect(html.includes('"fileName":"trace"')).toEqual(false);
  expect(html.includes('"fileName":"ignored text"')).toEqual(false);
  expect(html.includes('"fileName":"regular text"')).toEqual(true);
}
