import crypto from 'node:crypto';
import {
  BDDGEN_CMD,
  expect,
  execPlaywrightTest,
  PLAYWRIGHT_CMD,
  test,
  TestDir,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const generatedFile = '.features-gen/source-maps.feature.spec.js';
const sourceMapFile = `${generatedFile}.map`;

test(`${testDir.name}: no source maps`, () => {
  testDir.clearDir('.features-gen');
  testDir.clearDir('actual-reports');

  const stdout = execPlaywrightTest(testDir.name, {
    cmd: `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD}`,
  });

  expect(stdout).toContain('first scenario executed');
  expect(stdout).toContain('second scenario executed');
  expect(stdout).toContain('2 passed');
  testDir.expectFileNotExist(sourceMapFile);
  testDir.expectFileNotContain(generatedFile, ['// Source hash:', 'sourceMappingURL=']);
  testDir.expectFileExists('actual-reports/messages.ndjson');
});

test(`${testDir.name}: with source maps`, () => {
  testDir.clearDir('.features-gen');
  testDir.clearDir('actual-reports');

  const stdout = execPlaywrightTest(testDir.name, {
    cmd: `${BDDGEN_CMD} && ${PLAYWRIGHT_CMD} features/source-maps.feature:6`,
    env: { TEST_SOURCE_MAPS: 'true' },
  });

  expect(stdout).not.toContain('first scenario executed');
  expect(stdout).toContain('second scenario executed');
  expect(stdout).toContain('1 passed');
  testDir.expectFileExists(sourceMapFile);
  testDir.expectFileExists('actual-reports/messages.ndjson');

  const sourceMapContent = testDir.getFileContents(sourceMapFile);
  const sourceMap = JSON.parse(sourceMapContent);
  expect(sourceMap.file).toEqual('source-maps.feature.spec.js');
  expect(sourceMap.sources).toEqual(['../features/source-maps.feature']);
  expect(sourceMap.sourcesContent).toEqual([
    testDir.getFileContents('features/source-maps.feature'),
  ]);
  expect(sourceMap.mappings).not.toEqual('');

  const sourceHash = crypto.createHash('sha1').update(sourceMapContent).digest('hex').slice(0, 8);
  testDir.expectFileContains(generatedFile, [
    `// Source hash: ${sourceHash}`,
    '//# sourceMappingURL=source-maps.feature.spec.js.map',
  ]);
});
