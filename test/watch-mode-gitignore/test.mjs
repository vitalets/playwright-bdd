import { test, TestDir } from '../_helpers/index.mjs';
import { WatchProcess } from '../watch-mode/helpers/watchProcess.mjs';

const testDir = new TestDir(import.meta);
const ignoredChangeFile = 'ignored/ignored-change.ts';

test(`${testDir.name}: ignore changes per .gitignore`, async () => {
  setup();
  const watchProcess = new WatchProcess(testDir).start();

  try {
    await watchProcess.ready();
    await watchProcess.expectNoGeneration(() => {
      testDir.writeFile(ignoredChangeFile, '// ignored by package root gitignore');
    });
  } finally {
    await watchProcess.stop();
  }
});

test(`${testDir.name}: custom gitignore`, async () => {
  setup();
  const watchProcess = new WatchProcess(testDir).start({
    env: { WATCH_GIT_IGNORE: '.gitignore-custom' },
  });

  try {
    await watchProcess.ready();
    await watchProcess.expectNoGeneration(() => {
      testDir.writeFile(ignoredChangeFile, '// ignored by custom gitignore');
    });
  } finally {
    await watchProcess.stop();
  }
});

test(`${testDir.name}: gitignore false`, async () => {
  setup();
  const watchProcess = new WatchProcess(testDir).start({
    env: { WATCH_GIT_IGNORE: 'false' },
  });

  try {
    await watchProcess.ready();
    await watchProcess.changeAndWait(() => {
      testDir.writeFile(ignoredChangeFile, '// gitignore is disabled');
    });
  } finally {
    await watchProcess.stop();
  }
});

function setup() {
  testDir.clearDir('.features-gen');
  testDir.clearDir('ignored');
}
