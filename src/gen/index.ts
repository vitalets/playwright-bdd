/**
 * Generate playwright test files from Gherkin documents.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { GherkinDocument, Pickle } from '@cucumber/messages';
import fg from 'fast-glob';
import { TestFile } from './testFile';
import { loadConfig as loadCucumberConfig } from '../cucumber/loadConfig';
import { loadFeatures } from '../cucumber/loadFeatures';
import { loadSteps } from '../cucumber/loadSteps';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { extractCucumberConfig, BDDConfig } from '../config';
import { exitWithMessage, log } from '../utils';

export async function generateTestFiles(config: BDDConfig) {
  const { runConfiguration } = await loadCucumberConfig({
    provided: extractCucumberConfig(config),
  });
  const [features, supportCodeLibrary] = await Promise.all([
    loadFeatures(runConfiguration),
    loadSteps(runConfiguration),
  ]);
  const files = buildFiles(features, supportCodeLibrary, config);
  assertConfigForCustomTest(files, config);
  const paths = await saveFiles(files, config);
  if (config.verbose) log(`Generated files: ${paths.length}`);
  return paths;
}

function buildFiles(
  features: Map<GherkinDocument, Pickle[]>,
  supportCodeLibrary: ISupportCodeLibrary,
  { outputDir, importTestFrom }: BDDConfig,
) {
  const files: TestFile[] = [];
  features.forEach((pickles, doc) => {
    const file = new TestFile({
      doc,
      pickles,
      supportCodeLibrary,
      outputDir,
      importTestFrom,
    }).build();
    files.push(file);
  });
  return files;
}

async function saveFiles(files: TestFile[], { outputDir, verbose }: BDDConfig) {
  await clearDir(outputDir);
  return files.map((file) => {
    file.save();
    if (verbose) log(`Generated: ${path.relative(process.cwd(), file.outputPath)}`);
    return file.outputPath;
  });
}

async function clearDir(dir: string) {
  const testFiles = await fg(path.join(dir, '**', '*.spec.js'));
  const tasks = testFiles.map((testFile) => fs.rm(testFile));
  await Promise.all(tasks);
}

function assertConfigForCustomTest(files: TestFile[], config: BDDConfig) {
  const hasCustomTest = files.some((file) => file.customTest);
  if (hasCustomTest && !config.importTestFrom) {
    exitWithMessage(
      `When using custom "test" function in createBdd() you should ` +
        `set "importTestFrom" config option that points to file exporting custom test.`,
    );
  }
}
