import crypto from 'node:crypto';
import path from 'node:path';
import {
  BDDGEN_CMD,
  expect,
  execPlaywrightTest,
  PLAYWRIGHT_CMD,
  test,
  TestDir,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const featureFile = 'features/source-maps.feature';
const generatedFile = '.features-gen/source-maps.feature.spec.js';
const sourceMapFile = `${generatedFile}.map`;

test(testDir.name, () => {
  testDir.clearDir('.features-gen');
  testDir.clearDir('actual-reports');

  const stdout = execPlaywrightTest(testDir.name, {
    cmd: [
      `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD}`,
      'features/source-maps.feature:3',
      'features/source-maps.feature:6',
      'features/source-maps.feature:20',
      'features/source-maps.feature:22',
    ].join(' '),
  });

  expect(stdout).toContain('scenario 1 message');
  expect(stdout).toContain('message1');
  expect(stdout).toContain('message2');
  expect(stdout).not.toContain('message3');
  expect(stdout).toContain('message4');
  expect(stdout).toContain('scenario 2 message');
  expect(stdout).toContain('5 passed');

  testDir.expectFileExists(sourceMapFile);

  const sourceMapContent = testDir.getFileContents(sourceMapFile);
  const sourceMap = JSON.parse(sourceMapContent);
  expect(sourceMap.version).toBe(3);
  expect(sourceMap.file).toBe('source-maps.feature.spec.js');
  expect(sourceMap.sources).toEqual(['../features/source-maps.feature']);
  expect(sourceMap.sourcesContent).toEqual([testDir.getFileContents(featureFile)]);

  const sourceHash = crypto.createHash('sha1').update(sourceMapContent).digest('hex').slice(0, 8);
  testDir.expectFileContains(generatedFile, [
    `// Source hash: ${sourceHash}`,
    '//# sourceMappingURL=source-maps.feature.spec.js.map',
  ]);

  const file = path.normalize(featureFile);
  checkReporterStepLocations({
    'Given I log "scenario 1 message"': { file, line: 4, column: 5 },
    'Given I log "message1"': { file, line: 7, column: 5 },
    'Given I log "message2"': { file, line: 7, column: 5 },
    'Given I log "message4"': { file, line: 15, column: 5 },
    'Given I log "scenario 2 message"': { file, line: 25, column: 7 },
  });
});

test(`${testDir.name} (disabled)`, () => {
  testDir.clearDir('.features-gen');
  execPlaywrightTest(testDir.name, {
    cmd: BDDGEN_CMD,
    env: { SOURCE_MAPS: 'false' },
  });

  testDir.expectFileNotExist(sourceMapFile);
  testDir.expectFileNotContain(generatedFile, '//# sourceMappingURL=');

  const featureContent = testDir.getFileContents(featureFile);
  const sourceHash = crypto.createHash('sha1').update(featureContent).digest('hex').slice(0, 8);
  testDir.expectFileContains(generatedFile, `// Source hash: ${sourceHash}`);
});

function checkReporterStepLocations(expectedLocations) {
  const projectDir = testDir.getAbsPath('.');
  const actualLocations = Object.fromEntries(
    testDir
      .getAllFiles('actual-reports/raw-json')
      .flatMap(
        (file) => JSON.parse(testDir.getFileContents(`actual-reports/raw-json/${file}`)).steps,
      )
      .filter((step) => step.category === 'test.step')
      .map((step) => [
        step.title,
        {
          ...step.location,
          file: path.relative(projectDir, step.location.file),
        },
      ]),
  );

  expect(actualLocations).toEqual(expectedLocations);
}
