import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test, expect, normalize, TestDir } from '../_helpers/index.mjs';
import { startWatchProcess } from './helpers/startWatchProcess.mjs';

const testDir = new TestDir(import.meta);
const featureFile = 'features/sample.feature';
const stepFile = 'steps/steps.ts';
const dependencyFile = 'src/pattern.ts';
const outputDir = '.features-gen';
const outputFile = `${outputDir}/features/sample.feature.spec.js`;
const outputChangeFile = `${outputDir}/output-change.txt`;
const ignoredChangeFile = 'ignored/ignored-change.txt';
const GENERATION_COMPLETED = 'Generation completed. Waiting for changes...';
const GENERATION_FAILED = 'Generation failed. Waiting for changes...';

test(testDir.name, async () => {
  testDir.clearDir(outputDir);
  createInputFiles();
  const watchProcess = startWatchProcess();

  try {
    // This is the typical setup: package.json and Playwright config share the project root.
    await verifyInitialGeneration(watchProcess);

    // Changes in files trigger re-generation
    await verifyFeatureChange(watchProcess);
    await verifyStepChange(watchProcess);
    await verifyDependencyChange(watchProcess);

    // Files inside the generated output directory must not trigger regeneration.
    await verifyOutputChange(watchProcess);

    // A generation failure must leave the watcher alive for the next valid edit.
    await verifyErrorRecovery(watchProcess);
  } finally {
    await watchProcess.stop();
  }
});

test(`${testDir.name} (include paths)`, async () => {
  testDir.clearDir(outputDir);
  createInputFiles();
  const extraWatchPath = fs.mkdtempSync(path.join(os.tmpdir(), 'bddgen-watch-'));
  createExternalFile(extraWatchPath);
  const watchProcess = startWatchProcess({
    env: { BDDGEN_TEST_INCLUDE_WATCH_PATH: extraWatchPath },
  });

  try {
    // An explicitly configured path outside the nearest package.json directory also triggers generation.
    await watchProcess.waitForOutput(GENERATION_COMPLETED);
    await changeAndWait(watchProcess, () => {
      createExternalFile(extraWatchPath, { footer: '// external dependency changed' });
    });
  } finally {
    await watchProcess.stop();
    fs.rmSync(extraWatchPath, { recursive: true });
  }
});

test(`${testDir.name} (exclude paths)`, async () => {
  testDir.clearDir(outputDir);
  testDir.clearDir('ignored');
  createInputFiles();
  const watchProcess = startWatchProcess({
    env: { BDDGEN_TEST_EXCLUDE_WATCH_PATH: 'ignored' },
  });

  try {
    await watchProcess.waitForOutput(GENERATION_COMPLETED);

    // Files matching configured ignore paths must not trigger regeneration.
    await verifyIgnoredPathChange(watchProcess);
  } finally {
    await watchProcess.stop();
  }
});

function createInputFiles() {
  writeFeatureFile();
  writeStepFile();
  writeDependencyFile();
}

function createExternalFile(extraWatchPath, { footer = '' } = {}) {
  testDir.writeFile(
    path.join(extraWatchPath, 'dependency.ts'),
    ['export const value = 1;', footer].filter(Boolean).join('\n\n'),
  );
}

function writeFeatureFile({ footer = '' } = {}) {
  testDir.writeFile(
    featureFile,
    ['Feature: Watch mode', '  Scenario: Initial scenario\n    Given state 1', footer]
      .filter(Boolean)
      .join('\n\n'),
  );
}

function writeStepFile({ footer = '' } = {}) {
  testDir.writeFile(
    stepFile,
    [
      `import { createBdd } from 'playwright-bdd';\nimport { statePattern } from '../src/pattern.js';`,
      `const { Given } = createBdd();`,
      `Given(statePattern, async ({}, _state: number) => {});`,
      footer,
    ]
      .filter(Boolean)
      .join('\n\n'),
  );
}

function writeDependencyFile({ footer = '' } = {}) {
  testDir.writeFile(
    dependencyFile,
    [`export const statePattern = 'state {int}';`, footer].filter(Boolean).join('\n\n'),
  );
}

async function verifyInitialGeneration(watchProcess) {
  await watchProcess.waitForOutput(GENERATION_COMPLETED);
  expect(watchProcess.output).toContain(normalize('test/watch-mode'));
  testDir.expectFileExists(outputFile);
  testDir.expectFileContains(outputFile, 'Initial scenario');
}

async function verifyOutputChange(watchProcess) {
  const outputOffset = watchProcess.output.length;
  testDir.writeFile(outputChangeFile, 'output change');
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(watchProcess.output.slice(outputOffset)).not.toContain(GENERATION_COMPLETED);
}

async function verifyIgnoredPathChange(watchProcess) {
  const outputOffset = watchProcess.output.length;
  testDir.writeFile(ignoredChangeFile, 'ignored change');
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(watchProcess.output.slice(outputOffset)).not.toContain(GENERATION_COMPLETED);
}

async function verifyFeatureChange(watchProcess) {
  const output = await changeAndWait(watchProcess, () => {
    writeFeatureFile({ footer: '    And state 2' });
  });
  expectChangedFile(output, featureFile);
  testDir.expectFileContains(outputFile, 'And state 2');
}

async function verifyStepChange(watchProcess) {
  await changeAndWait(watchProcess, () => {
    writeStepFile({ footer: '// step changed' });
  });
}

async function verifyDependencyChange(watchProcess) {
  await changeAndWait(watchProcess, () => {
    writeDependencyFile({ footer: '// dependency changed' });
  });
}

async function verifyErrorRecovery(watchProcess) {
  await changeAndWait(
    watchProcess,
    () => writeFeatureFile({ footer: 'broken feature' }),
    GENERATION_FAILED,
  );
  await changeAndWait(watchProcess, () => {
    writeFeatureFile({ footer: '    And state 3' });
  });
  testDir.expectFileContains(outputFile, 'And state 3');
}

async function changeAndWait(watchProcess, change, expected = GENERATION_COMPLETED) {
  const outputOffset = watchProcess.output.length;
  change();
  await watchProcess.waitForOutput(expected, outputOffset);
  return watchProcess.output.slice(outputOffset);
}

function expectChangedFile(output, file) {
  expect(output).toContain(`Changes detected: ${normalize(file)}\nRegenerating...`);
}
