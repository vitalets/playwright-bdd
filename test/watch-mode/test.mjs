import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test, expect, normalize, startProcess, TestDir, waitFor } from '../_helpers/index.mjs';
import { startWatchProcess } from './helpers/startWatchProcess.mjs';

const testDir = new TestDir(import.meta);
const featureFile = 'features/sample.feature';
const stepFile = 'steps/steps.ts';
const dependencyFile = 'src/pattern.ts';
const outputDir = '.features-gen';
const outputFile = `${outputDir}/features/sample.feature.spec.js`;
const outputChangeFile = `${outputDir}/output-change.txt`;
const excludedChangeFile = 'ignored/ignored-change.ts';
const customGitIgnoreDir = 'custom-gitignore';
const customGitIgnoreFile = `${customGitIgnoreDir}/.bddignore`;
const ignoredChangeFile = `${customGitIgnoreDir}/ignored/ignored-change.ts`;
const reIncludedChangeFile = `${customGitIgnoreDir}/ignored/re-included-change.ts`;
const GENERATION_COMPLETED = 'Generation completed. Waiting for changes...';
const GENERATION_FAILED = 'Generation failed. Waiting for changes...';

test(testDir.name, async () => {
  clearDirs();
  writeFeatureAndStepFiles();
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
  clearDirs();
  writeFeatureAndStepFiles();
  const extraWatchPath = fs.mkdtempSync(path.join(os.tmpdir(), 'bddgen-watch-'));
  createExternalFile(extraWatchPath);
  const watchProcess = startWatchProcess({
    env: { WATCH_INCLUDE: extraWatchPath },
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
  clearDirs();
  testDir.clearDir('ignored');
  writeFeatureAndStepFiles();
  const watchProcess = startWatchProcess({
    env: { WATCH_EXCLUDE: 'ignored' },
  });

  try {
    await watchProcess.waitForOutput(GENERATION_COMPLETED);

    // Files matching configured ignore paths must not trigger regeneration.
    await verifyIgnoredPathChange(watchProcess);
  } finally {
    await watchProcess.stop();
  }
});

test(`${testDir.name} (package root gitignore)`, async () => {
  clearDirs();
  writeFeatureAndStepFiles();
  const watchProcess = startWatchProcess({ env: { WATCH_GIT_IGNORE: 'true' } });

  try {
    await watchProcess.waitForOutput(GENERATION_COMPLETED);
    await expectNoGeneration(watchProcess, () => {
      writeDependencyFile({ footer: '// ignored by package root gitignore' });
    });
  } finally {
    await watchProcess.stop();
  }
});

test(`${testDir.name} (custom gitignore)`, async () => {
  clearDirs();
  testDir.clearDir(customGitIgnoreDir);
  writeFeatureAndStepFiles();
  testDir.writeFile(ignoredChangeFile, '// initially watched');
  testDir.writeFile(reIncludedChangeFile, '// initially watched');
  const watchProcess = startWatchProcess({
    env: { WATCH_GIT_IGNORE: customGitIgnoreFile },
  });

  try {
    await watchProcess.waitForOutput(GENERATION_COMPLETED);

    // Creating the configured file reloads the watcher and applies Git-style negation.
    await changeAndWait(watchProcess, () => {
      testDir.writeFile(
        customGitIgnoreFile,
        ['ignored/*', '!ignored/re-included-change.ts'].join('\n'),
      );
    });
    await expectNoGeneration(watchProcess, () => {
      testDir.writeFile(ignoredChangeFile, '// ignored change');
    });
    await changeAndWait(watchProcess, () => {
      testDir.writeFile(reIncludedChangeFile, '// re-included change');
    });

    // Directory-only rules prune descendants, including paths previously re-included.
    await changeAndWait(watchProcess, () => {
      testDir.writeFile(customGitIgnoreFile, 'ignored/');
    });
    await expectNoGeneration(watchProcess, () => {
      testDir.writeFile(reIncludedChangeFile, '// now ignored');
    });

    // Removing the configured file reloads the watcher without ignore rules.
    await changeAndWait(watchProcess, () => {
      fs.rmSync(testDir.getAbsPath(customGitIgnoreFile));
    });
    await changeAndWait(watchProcess, () => {
      testDir.writeFile(ignoredChangeFile, '// watched after removal');
    });
  } finally {
    await watchProcess.stop();
    testDir.clearDir(customGitIgnoreDir);
  }
});

test(`${testDir.name}: with lock file enabled, waits for test execution to finish`, async () => {
  clearDirs();
  writeFeatureAndStepFiles();
  // run watch process
  const watchProcess = startWatchProcess({ env: { LOCK_FILE: 'true' } });

  try {
    await watchProcess.waitForOutput(GENERATION_COMPLETED);
    // run test execution
    const testProcess = startTestExecution();
    try {
      await waitFor(() => testDir.isFileExists('test-running.txt'));
      const outputOffset = watchProcess.output.length;
      // trigger change in feature file
      writeFeatureFile({ footer: '    And state 2' });
      await watchProcess.waitForOutput(
        'BDD tests are executing in .features-gen. Waiting...',
        outputOffset,
      );
      // spec file is not re-generated
      testDir.expectFileNotContain(outputFile, 'And state 2');

      // Further changes are retained and coalesced while generation is waiting.
      writeFeatureFile({ footer: '    And state 3' });
      await new Promise((resolve) => setTimeout(resolve, 300));
      testDir.expectFileNotContain(outputFile, 'And state 3');

      // stop test execution
      stopTestExecution();
      await testProcess.waitForExit();
      expect(testProcess.exitCode).toBe(0);
      // assert that pending changes are appplied
      await watchProcess.waitForOutput(GENERATION_COMPLETED, outputOffset);
      testDir.expectFileContains(outputFile, 'And state 3');
      expect(countMatches(watchProcess.output.slice(outputOffset), GENERATION_COMPLETED)).toBe(1);
    } finally {
      await testProcess.stop();
    }
  } finally {
    await watchProcess.stop();
    stopTestExecution();
  }
});

function writeFeatureAndStepFiles() {
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
      `import { createBdd } from 'playwright-bdd';`,
      `import fs from 'node:fs';`,
      `import timers from 'node:timers/promises';`,
      `const { Given } = createBdd();`,
      `Given('state {int}', async ({}, _state: number) => {
        fs.writeFileSync('test-running.txt', 'running');
        while (fs.existsSync('test-running.txt')) await timers.setTimeout(25);
      });`,
      footer,
    ]
      .filter(Boolean)
      .join('\n\n'),
  );
}

function writeDependencyFile({ footer = '' } = {}) {
  testDir.writeFile(
    dependencyFile,
    [`export const foo = 42;`, footer].filter(Boolean).join('\n\n'),
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
  await expectNoGeneration(watchProcess, () => {
    testDir.writeFile(excludedChangeFile, 'export const ignoredChange = true;');
  });
}

async function expectNoGeneration(watchProcess, change) {
  const outputOffset = watchProcess.output.length;
  change();
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

function startTestExecution() {
  return startProcess('npx playwright test', {
    cwd: testDir.getAbsPath('.'),
    env: { LOCK_FILE: 'true' },
  });
}

function stopTestExecution() {
  fs.rmSync(testDir.getAbsPath('test-running.txt'), { force: true });
}

function clearDirs() {
  testDir.clearDir(outputDir);
  stopTestExecution();
}

function countMatches(value, search) {
  return value.split(search).length - 1;
}
