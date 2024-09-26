import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';
import path from 'node:path';
import fg from 'fast-glob';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTest(testDir.name);

  checkHtmlReport();
  checkAttachmentFiles();
});

function checkHtmlReport() {
  const html = testDir.getFileContents('actual-reports/report.html');
  expect(html.includes('"fileName":"my image","url":".\\/attachments\\/')).toEqual(true);
  expect(html.includes('"fileName":"screenshot","url":".\\/attachments\\/')).toEqual(true);
  expect(html.includes('"fileName":"video","url":".\\/attachments\\/')).toEqual(true);
  expect(html.includes('"fileName":"trace","url":".\\/attachments\\/')).toEqual(true);
  expect(html.includes('"fileName":"plain text"}')).toEqual(true);
  expect(html.includes('"fileName":"json"}')).toEqual(true);
}

function checkAttachmentFiles() {
  const extensions = fg
    .sync('actual-reports/attachments/*', { cwd: path.dirname(testDir.getAbsPath()) })
    .map((file) => path.extname(file))
    .sort();
  expect(extensions).toEqual(['.png', '.png', '.webm', '.zip']);
}
