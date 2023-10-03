import { test, getTestName, execPlaywrightTest, TestDir } from '../helpers.mjs';
import { expect } from '@playwright/test';

const testDir = new TestDir(import.meta);
test(getTestName(import.meta), (t) => execPlaywrightTest(t.name));

test(testDir.name + '-generate-scenario-outlines', () => {
    const outputDir = testDir.getAbsPath('.features-gen');
    testDir.clearDir(outputDir);

    execPlaywrightTest(testDir.name, 'node ../../dist/cli --tags "@outline"');

    // important to keep included files in separate directory (subdir)
    // to ensure that directory structure kept the same when running with tags

    let fileContents = testDir.getFileContents(
        '.features-gen/sample.feature.spec.js',
    );
    expect(fileContents).toContain(`test.describe("русский язык"`);
    expect(fileContents).toContain(`test.describe("русский сценарий 2"`);
    expect(fileContents).not.toContain(`test("русский сценарий 2"`);
    expect(fileContents).toContain(`test("Example #1",`);
    expect(fileContents).toContain(`test("Example #2",`);

});

