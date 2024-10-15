import { test, normalize, TestDir, execPlaywrightTest, expect } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  testDir.clearDir('actual-reports');

  execPlaywrightTest(testDir.name);

  checkGeneratedSpecFile();
  checkHtmlReport();
  checkCustomReport();
});

function checkGeneratedSpecFile() {
  const fileContents = testDir.getFileContents('.features-gen/ru.feature.spec.js');
  expect(fileContents).toContain(`test.describe("русский язык"`);
  expect(fileContents).toContain(`test("сценарий 1"`);
  expect(fileContents).toContain(`test.describe("сценарий 2"`);
  expect(fileContents).not.toContain(`test("сценарий 2"`);
  expect(fileContents).toContain(`test("Example #1",`);
  expect(fileContents).toContain(`test("Example #2",`);
}

function checkHtmlReport() {
  expect(testDir.getFileContents('actual-reports/report.html')).toContain('Сценарий');
}

function checkCustomReport() {
  const content = testDir.getFileContents('actual-reports/report.txt');

  expect(content).toContain(
    `Пусть Состояние 0 ${normalize('.features-gen/ru.feature.spec.js')}:7:11`,
  );
  expect(content).toContain(
    `Когда Действие 1 ${normalize('.features-gen/ru.feature.spec.js')}:14:11`,
  );
  expect(content).toContain(
    `То Переданный аргумент "куку" содержит 4 буквы ${normalize('.features-gen/ru.feature.spec.js')}:16:11`,
  );
  expect(content).toContain(`* Результат 2 ${normalize('.features-gen/ru.feature.spec.js')}:17:11`);
}
