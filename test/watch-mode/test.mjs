import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test, expect, normalize, TestDir } from '../_helpers/index.mjs';
import { GENERATION_COMPLETED, GENERATION_FAILED, WatchProcess } from './helpers/watchProcess.mjs';

const testDir = new TestDir(import.meta);
const featureFile = 'features/sample.feature';
const outputFile = '.features-gen/features/sample.feature.spec.js';

test(`${testDir.name}: re-generate on change`, async () => {
  setup();
  const watchProcess = new WatchProcess(testDir).start();

  try {
    // This is the typical setup: package.json and Playwright config share the project root.
    await verifyInitialGeneration(watchProcess);

    // Changes in files trigger re-generation
    await verifyFeatureChange(watchProcess);
    await verifyStepChange(watchProcess);
    await verifySrcChange(watchProcess);

    // Files inside the generated output directory must not trigger regeneration.
    await verifyOutputChange(watchProcess);

    // A generation failure must leave the watcher alive for the next valid edit.
    await verifyErrorRecovery(watchProcess);
  } finally {
    await watchProcess.stop();
  }
});

test(`${testDir.name}: include paths`, async () => {
  setup();

  // prepare external directory
  const extraWatchPath = fs.mkdtempSync(path.join(os.tmpdir(), 'bddgen-watch-'));
  createExternalFile(extraWatchPath);

  const watchProcess = new WatchProcess(testDir).start({
    env: { WATCH_INCLUDE: extraWatchPath },
  });

  try {
    await watchProcess.ready();
    await watchProcess.changeAndWait(() => {
      createExternalFile(extraWatchPath);
    });
  } finally {
    await watchProcess.stop();
    fs.rmSync(extraWatchPath, { recursive: true });
  }
});

test(`${testDir.name}: exclude paths`, async () => {
  setup();
  const watchProcess = new WatchProcess(testDir).start({
    env: { WATCH_EXCLUDE: 'src' },
  });

  try {
    await watchProcess.ready();
    await watchProcess.expectNoGeneration(() => writeSrcFile());
  } finally {
    await watchProcess.stop();
  }
});

test(`${testDir.name}: verbose output`, async () => {
  setup();
  const watchProcess = new WatchProcess(testDir).start({
    args: ['--verbose'],
  });
  try {
    await watchProcess.ready();
    expect(watchProcess.output).toContain('bddgen v');
    expect(watchProcess.output).toContain('Found feature files (1)');
    expect(watchProcess.output).not.toContain('Done (');
    await verifyErrorRecovery(watchProcess);
    expect(watchProcess.output).toContain('generation failed; watching for changes');
  } finally {
    await watchProcess.stop();
  }
});

test(`${testDir.name}: interrupted generation recovers`, async () => {
  setup();
  const watchProcess = new WatchProcess(testDir).start();
  try {
    await watchProcess.ready();
    const output = await watchProcess.changeAndWait(
      () => writeStepFile({ footer: `process.kill(process.pid, 'SIGKILL');` }),
      // Windows reports a self-killed child as a nonzero exit without a signal.
      process.platform === 'win32' ? GENERATION_FAILED : 'generation interrupted (SIGKILL)',
    );
    expect(output).not.toContain(GENERATION_COMPLETED);
    await watchProcess.changeAndWait(() => writeStepFile());
  } finally {
    await watchProcess.stop();
  }
});

async function verifyInitialGeneration(watchProcess) {
  await watchProcess.ready();
  expect(watchProcess.output).toContain('bddgen v');
  expect(watchProcess.output).toContain('Config:  playwright.config.ts');
  expect(watchProcess.output).toContain('Watch:   .');
  expect(watchProcess.output).toMatch(/Ready in \d+ ms\. Watching for changes\./);
  testDir.expectFileExists(outputFile);
  testDir.expectFileContains(outputFile, 'Initial scenario');
}

async function verifyFeatureChange(watchProcess) {
  const output = await watchProcess.changeAndWait(() => {
    writeFeatureFile({ footer: '    And state 2' });
  });
  expect(output).toContain(`[bddgen] changed ${normalize(featureFile)}`);
  expect(output).toMatch(/\d{2}:\d{2}:\d{2} \[bddgen\] generated in \d+ ms/);
  testDir.expectFileContains(outputFile, 'And state 2');
}

async function verifyStepChange(watchProcess) {
  await watchProcess.changeAndWait(() => {
    writeStepFile({ footer: '// step changed' });
  });
}

async function verifySrcChange(watchProcess) {
  await watchProcess.changeAndWait(() => writeSrcFile());
}

async function verifyOutputChange(watchProcess) {
  const outputOffset = watchProcess.output.length;
  testDir.writeFile('.features-gen/output-change.txt', 'output change');
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(watchProcess.output.slice(outputOffset)).not.toContain(GENERATION_COMPLETED);
}

async function verifyErrorRecovery(watchProcess) {
  await watchProcess.changeAndWait(
    () => writeFeatureFile({ footer: 'broken feature' }),
    GENERATION_FAILED,
  );
  await watchProcess.changeAndWait(() => {
    writeFeatureFile({ footer: '    And state 3' });
  });
  testDir.expectFileContains(outputFile, 'And state 3');
}

function setup() {
  testDir.clearDir('.features-gen');
  testDir.clearDir('src');
  writeFeatureAndStepFiles();
}

function writeFeatureAndStepFiles() {
  writeFeatureFile();
  writeStepFile();
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
    'features/steps.ts',
    [
      `import { createBdd } from 'playwright-bdd';`,
      `const { Given } = createBdd();`,
      `Given('state {int}', async ({}, _state: number) => {});`,
      footer,
    ]
      .filter(Boolean)
      .join('\n\n'),
  );
}

function writeSrcFile() {
  testDir.writeFile('src/index.ts', [`export const foo = 42;`]);
}

function createExternalFile(extraWatchPath, { footer = '' } = {}) {
  testDir.writeFile(
    path.join(extraWatchPath, 'external.ts'),
    ['export const value = 1;', footer].filter(Boolean).join('\n\n'),
  );
}
