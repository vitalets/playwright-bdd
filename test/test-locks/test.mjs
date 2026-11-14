import {
  test,
  expect,
  normalize,
  TestDir,
  BDDGEN_CMD,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  playwrightVersion,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const supportsLocks = playwrightVersion >= '1.63';

test(
  `${testDir.name}: propagates matched step locks to generated tests`,
  { skip: !supportsLocks },
  () => {
    execPlaywrightTest(testDir.name);
    checkGeneratedLocks();
  },
);

test(
  `${testDir.name}: inherits Feature and Rule Background locks`,
  { skip: !supportsLocks },
  () => {
    generate('lock-in-background-step.feature');
    checkGeneratedLocks();
  },
);

test(`${testDir.name}: omits locks from scenarios skipped during generation`, () => {
  generate('lock-in-skipped-step.feature', { LOCK_TAGS: 'not @runtime-skip and not @fail-on-run' });
  checkGeneratedLocks();
});

test(
  `${testDir.name}: runtime skips and fail-on-run retain locks from known steps`,
  { skip: !supportsLocks },
  () => {
    generate('lock-in-skipped-step.feature', {
      LOCK_MISSING: 'fail-on-run',
      LOCK_TAGS: 'not @skip-missing',
    });
    checkGeneratedLocks();
  },
);

test(
  `${testDir.name}: escapes lock names with single, double, and backtick quotes`,
  { skip: !supportsLocks },
  () => {
    generate('lock-in-step.feature', { LOCK_QUOTES: 'single' });
    const generatedFile = '.features-gen/lock-in-step.feature.spec.js';

    testDir.expectFileContains(
      generatedFile,
      "lock: ['single\\' double\" backtick` slash\\\\ dollar${name}\\nline']",
    );

    generate('lock-in-step.feature', { LOCK_QUOTES: 'double' });
    testDir.expectFileContains(
      generatedFile,
      'lock: ["single\' double\\" backtick` slash\\\\ dollar${name}\\nline"]',
    );

    generate('lock-in-step.feature', { LOCK_QUOTES: 'backtick' });
    testDir.expectFileContains(
      generatedFile,
      'lock: [`single\' double" backtick\\` slash\\\\ dollar\\${name}\\nline`]',
    );
  },
);

test(
  `${testDir.name}: rejects locks on unsupported Playwright versions`,
  { skip: supportsLocks },
  () => {
    execPlaywrightTestWithError(
      testDir.name,
      [
        'Test locks require Playwright 1.63 or later',
        `installed: ${playwrightVersion}`,
        'Upgrade @playwright/test',
        `Step: ${normalize('features/lock-in-step.feature')}:`,
      ],
      BDDGEN_CMD,
    );
  },
);

test(
  `${testDir.name}: inherits and combines tag locks with step locks`,
  { skip: !supportsLocks },
  () => {
    generate('lock-in-tags.feature');
    checkGeneratedLocks();
    testDir.expectFileContains('.features-gen/lock-in-tags.feature.spec.js', "'@lock:scenario'");
    generate('lock-in-tags-validation.feature', { LOCK_TAGS: '@case-sensitive' });
    checkGeneratedLocks();
  },
);

test(`${testDir.name}: rejects empty lock tags on runnable scenarios`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'Lock tag "@lock:" requires a nonempty name.',
      `Scenario: ${normalize('features/lock-in-tags-validation.feature')}:`,
    ],
    {
      cmd: BDDGEN_CMD,
      env: { LOCK_FEATURES: 'lock-in-tags-validation.feature', LOCK_TAGS: '@invalid' },
    },
  );
});

test(`${testDir.name}: ignores ordinary tags and filters out unused lock tags`, () => {
  generate('lock-in-tags-validation.feature', { LOCK_TAGS: '@ordinary' });
  checkGeneratedLocks();
});

test(
  `${testDir.name}: rejects tag locks on unsupported Playwright versions`,
  { skip: supportsLocks },
  () => {
    execPlaywrightTestWithError(
      testDir.name,
      [
        'Test locks require Playwright 1.63 or later',
        'Upgrade @playwright/test',
        `Tag: @lock:feature. Scenario: ${normalize('features/lock-in-tags.feature')}:`,
      ],
      { cmd: BDDGEN_CMD, env: { LOCK_FEATURES: 'lock-in-tags.feature' } },
    );
  },
);

test(`${testDir.name}: escapes tag locks`, { skip: !supportsLocks }, () => {
  generate('lock-in-tags-validation.feature', { LOCK_TAGS: '@escaped', LOCK_QUOTES: 'single' });
  testDir.expectFileContains(
    '.features-gen/lock-in-tags-validation.feature.spec.js',
    "lock: ['single\\'double\"backtick`slash\\\\dollar${name}']",
  );
});

function checkGeneratedLocks() {
  const declarations = testDir
    .getAllFiles('.features-gen')
    .filter((file) => file.endsWith('.spec.js'))
    .flatMap((file) => testDir.getFileContents(`.features-gen/${file}`).split('\n'))
    .filter((line) => /^\s*test(?:\.(?:skip|fixme|only))?\(/.test(line))
    .filter((line) => line.includes("('["));
  expect(declarations.length).toBeGreaterThan(0);
  for (const line of declarations) {
    const scenario = line.match(/\('([^']+)',/)[1];
    const lockNames = scenario.match(/^\[([^\]]*)\]/)[1];
    expect(lockNames, scenario).toBeDefined();
    const actual = line.match(/(?:[{,]\s*)lock: (\[[^\]]*\])/)?.[1];
    const expected =
      lockNames === ''
        ? undefined
        : `[${lockNames
            .split(', ')
            .map((lock) => `'${lock}'`)
            .join(', ')}]`;
    expect(actual, scenario).toEqual(expected);
  }
}

function generate(features, env = {}) {
  execPlaywrightTest(testDir.name, {
    cmd: BDDGEN_CMD,
    env: { LOCK_FEATURES: features, ...env },
  });
}
