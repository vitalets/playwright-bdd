import { test, expect, TestDir, execPlaywrightTest } from '../_helpers/index.mjs';
import path from 'node:path';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTest(testDir.name);

  checkHtmlReport();
  checkAttachmentFiles();
  checkTraceViewer();
});

function checkHtmlReport() {
  const html = testDir.getFileContents('actual-reports/index.html');

  expect(html.includes('"fileName":"image as path","body":""')).toEqual(true);
  expect(html.includes('"fileName":"image as buffer","body":""')).toEqual(true);
  expect(html.includes('"fileName":"screenshot","body":""')).toEqual(true);
  expect(html.includes('"fileName":"video","body":""')).toEqual(true);
  expect(html.includes('"fileName":"trace","body":""')).toEqual(true);
  expect(html.includes('"fileName":"plain text","body":"Zm9v"')).toEqual(true);
  expect(html.includes('"fileName":"json text","body":"eyJmb28iOiJiYXIifQ=="')).toEqual(true);
}

function checkAttachmentFiles() {
  const extensions = testDir
    .getAllFiles('actual-reports/data')
    .map((file) => path.extname(file))
    .sort();
  expect(extensions).toEqual(['.jpeg', '.png', '.png', '.webm', '.zip']);
}

function checkTraceViewer() {
  testDir.expectFileExists('actual-reports/trace/index.html');
}
