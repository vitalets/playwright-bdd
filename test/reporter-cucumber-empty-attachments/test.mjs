/**
 * An empty attachment, from attach() or from an empty stdout/stderr chunk,
 * must not stop the cucumber reporters.
 */
import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTest(testDir.name);

  checkMessagesReport();
  checkJsonReport();
  checkHtmlReport();
});

function checkMessagesReport() {
  const envelopes = testDir
    .getFileContents('actual-reports/messages.ndjson')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  const attachments = envelopes.filter((e) => e.attachment).map((e) => e.attachment);

  // every scenario is in the report, including the one after the empty attachments
  expect(envelopes.filter((e) => e.testCaseFinished)).toHaveLength(3);
  expect(envelopes.at(-1).testRunFinished).toBeDefined();
  expect(attachments.find((a) => a.fileName === 'empty text')).toMatchObject({ body: '' });
  // an empty chunk is no output: stdout gets an attachment, stderr doesn't
  expect(attachments.find((a) => a.fileName === 'stdout')?.body).toContain('some output');
  expect(attachments.find((a) => a.fileName === 'stderr')).toBeUndefined();
}

function checkJsonReport() {
  const report = JSON.parse(testDir.getFileContents('actual-reports/report.json'));
  const scenarios = report[0].elements;
  expect(scenarios).toHaveLength(3);
  expect(scenarios[1].steps[0].embeddings).toEqual([{ data: '', mime_type: 'text/plain' }]);
}

function checkHtmlReport() {
  testDir.expectFileContains('actual-reports/report.html', [
    'scenario after them',
    '"fileName":"empty text"',
  ]);
}
