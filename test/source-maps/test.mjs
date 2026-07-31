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
  const sourceHash = crypto.createHash('sha1').update(sourceMapContent).digest('hex').slice(0, 8);
  testDir.expectFileContains(generatedFile, [
    `// Source hash: ${sourceHash}`,
    '//# sourceMappingURL=source-maps.feature.spec.js.map',
  ]);
});
