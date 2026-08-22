import fs from 'node:fs';
import { test, expect, startPlaywrightTest, TestDir, waitFor } from '../_helpers/index.mjs';
import { GENERATION_COMPLETED, WatchProcess } from '../watch-mode/helpers/watchProcess.mjs';

const testDir = new TestDir(import.meta);
const outputFile = '.features-gen/features/sample.feature.spec.js';

test(`${testDir.name}: waits for test execution to finish`, async () => {
  clearDirs();
  writeFeatureAndStepFiles();
  const watchProcess = new WatchProcess(testDir).start();

  try {
    await watchProcess.ready();
    const testProcess = startTestExecution();
    try {
      await waitFor(() => testDir.isFileExists('test-running.txt'));
      const outputOffset = watchProcess.output.length;

      writeFeatureFile({ footer: '    And state 2' });
      await watchProcess.waitForOutput(
        'BDD tests are executing in .features-gen. Waiting...',
        outputOffset,
      );
      testDir.expectFileNotContain(outputFile, 'And state 2');

      // Further changes are retained and coalesced while generation is waiting.
      writeFeatureFile({ footer: '    And state 3' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      testDir.expectFileNotContain(outputFile, 'And state 3');

      stopTestExecution();
      await testProcess.waitForExit();
      expect(testProcess.exitCode).toBe(0);

      await watchProcess.waitForOutput(GENERATION_COMPLETED, outputOffset);
      testDir.expectFileContains(outputFile, 'And state 3');
      expect(watchProcess.getGenerationsCount()).toBe(2);
    } finally {
      await testProcess.stop();
    }
  } finally {
    await watchProcess.stop();
    stopTestExecution();
  }
});

function clearDirs() {
  testDir.clearDir('.features-gen');
  stopTestExecution();
}

function writeFeatureAndStepFiles() {
  writeFeatureFile();
  testDir.writeFile(
    'features/steps.ts',
    [
      `import { createBdd } from 'playwright-bdd';`,
      `import fs from 'node:fs';`,
      `import timers from 'node:timers/promises';`,
      `const { Given } = createBdd();`,
      `Given('state {int}', async ({}, _state: number) => {
        fs.writeFileSync('test-running.txt', 'running');
        while (fs.existsSync('test-running.txt')) await timers.setTimeout(25);
      });`,
    ].join('\n\n'),
  );
}

function writeFeatureFile({ footer = '' } = {}) {
  testDir.writeFile(
    'features/sample.feature',
    ['Feature: Watch mode', '  Scenario: Initial scenario\n    Given state 1', footer]
      .filter(Boolean)
      .join('\n\n'),
  );
}

function startTestExecution() {
  return startPlaywrightTest({
    cwd: testDir.getAbsPath('.'),
  });
}

function stopTestExecution() {
  fs.rmSync(testDir.getAbsPath('test-running.txt'), { force: true });
}
