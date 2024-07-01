/**
 * Handles exported tests to guess which test instance to use in spec files.
 */
import { TestTypeCommon } from '../playwright/types';
import { isPlaywrightTestInstance, isTestContainsFixture } from '../playwright/testTypeImpl';

const exportedTests = new Map<TestTypeCommon, ExportedTest>();

export type ExportedTest = {
  testInstance: TestTypeCommon;
  file: string;
  varName: string;
};

export function registerExportedTests(file: string, exportsObj: Record<string, unknown>) {
  for (const [varName, testInstance] of Object.entries(exportsObj)) {
    if (isPlaywrightTestInstance(testInstance) && !exportedTests.has(testInstance)) {
      exportedTests.set(testInstance, { testInstance, file, varName });
    }
  }
}

export function getExportedTest(customTest: TestTypeCommon) {
  return exportedTests.get(customTest);
}

export function findExportedTestWithFixture(fixtureName: string) {
  for (const [testInstance, exportedTest] of exportedTests.entries()) {
    if (isTestContainsFixture(testInstance, fixtureName)) {
      return exportedTest;
    }
  }
}
