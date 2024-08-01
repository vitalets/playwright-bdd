/**
 * Handles exported tests to guess which test instance to use in spec files.
 */
import { TestTypeCommon } from '../playwright/types';
import { isPlaywrightTestInstance, isTestContainsFixture } from '../playwright/testTypeImpl';

const exportedTests = new Map<TestTypeCommon, ExportedTestInfo>();

type ExportedTestInfo = {
  testInstance: TestTypeCommon;
  file: string;
  varName: string;
};

export function registerExportedTests(file: string, exportsObj: Record<string, unknown>) {
  const fileExportedTests: ExportedTestInfo[] = [];
  for (const [varName, testInstance] of Object.entries(exportsObj)) {
    if (!isPlaywrightTestInstance(testInstance)) continue;
    const exportedTest: ExportedTestInfo = { testInstance, file, varName };
    fileExportedTests.push(exportedTest);
    if (!exportedTests.has(testInstance)) {
      exportedTests.set(testInstance, exportedTest);
    }
  }

  return fileExportedTests;
}

export function getExportedTestInfo(customTest: TestTypeCommon) {
  return exportedTests.get(customTest);
}

export function getExportedTestsCount() {
  return exportedTests.size;
}

export function findExportedTestWithFixture(fixtureName: string) {
  for (const [testInstance, exportedTest] of exportedTests.entries()) {
    if (isTestContainsFixture(testInstance, fixtureName)) {
      return exportedTest;
    }
  }
}
