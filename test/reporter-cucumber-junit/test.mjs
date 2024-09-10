import {
  test,
  TestDir,
  execPlaywrightTestWithError,
  getJsonFromXmlFile,
} from '../_helpers/index.mjs';
import { assertShape } from '../reporter-cucumber-msg/helpers/json-shape.mjs';
import { junitReportFields } from './junit-report.fields.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, async () => {
  testDir.clearDir('actual-reports');
  execPlaywrightTestWithError(testDir.name);
  await assertJunitReport();
});

async function assertJunitReport() {
  const actualJson = await getJsonFromXmlFile(testDir.getAbsPath('actual-reports/report.xml'));
  const expectedJson = await getJsonFromXmlFile(
    testDir.getAbsPath('expected-reports/junit-report.xml'),
  );
  assertShape(actualJson, expectedJson, junitReportFields);
}
