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
import { hasTsNodeRegister, loadSteps } from '../cucumber/loadSteps';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { extractCucumberConfig, BDDConfig } from '../config';
import { exitWithMessage, log } from '../utils';
import { Snippets } from '../snippets';
import { IRunConfiguration } from '@cucumber/cucumber/api';
import { appendDecoratorSteps } from '../stepDefinitions/createBddDecorators';
import { requireTransform } from '../playwright/transform';

export async function generateTestFiles(config: BDDConfig) {
  const { runConfiguration } = await loadCucumberConfig({
    provided: extractCucumberConfig(config),
  });

  warnForTsNodeRegister(runConfiguration);

  const [features, supportCodeLibrary] = await Promise.all([
    loadFeatures(runConfiguration),
    loadSteps(runConfiguration),
  ]);

  await loadDecoratorSteps(config, supportCodeLibrary);

  const files = buildFiles(features, supportCodeLibrary, config);
  await checkUndefinedSteps(files, runConfiguration, supportCodeLibrary);
  checkImportCustomTest(files, config);
  const paths = await saveFiles(files, config);
  if (config.verbose) log(`Generated files: ${paths.length}`);

  return paths;
}

async function loadDecoratorSteps(config: BDDConfig, supportCodeLibrary: ISupportCodeLibrary) {
  if (config.importTestFrom) {
    // require importTestFrom for case when it is not required by step definitions
    // possible re-require but it's not a problem as it is cached by Node.js
    await requireTransform().requireOrImport(config.importTestFrom.file);
    appendDecoratorSteps(supportCodeLibrary);
  }
}

function buildFiles(
  features: Map<GherkinDocument, Pickle[]>,
  supportCodeLibrary: ISupportCodeLibrary,
  config: BDDConfig,
) {
  const files: TestFile[] = [];
  features.forEach((pickles, doc) => {
    const file = new TestFile({
      doc,
      pickles,
      supportCodeLibrary,
      config,
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

async function checkUndefinedSteps(
  files: TestFile[],
  runConfiguration: IRunConfiguration,
  supportCodeLibrary: ISupportCodeLibrary,
) {
  const undefinedSteps = files.reduce((sum, file) => sum + file.undefinedSteps.length, 0);
  if (undefinedSteps > 0) {
    const snippets = new Snippets(files, runConfiguration, supportCodeLibrary);
    await snippets.printSnippetsAndExit();
  }
}

function checkImportCustomTest(files: TestFile[], config: BDDConfig) {
  const hasCustomTest = files.some((file) => file.hasCustomTest);
  if (hasCustomTest && !config.importTestFrom) {
    exitWithMessage(
      `When using custom "test" function in createBdd() you should`,
      `set "importTestFrom" config option that points to file exporting custom test.`,
    );
  }
}

function warnForTsNodeRegister(runConfiguration: IRunConfiguration) {
  if (hasTsNodeRegister(runConfiguration)) {
    log(
      `WARNING: usage of requireModule: ['ts-node/register'] is not recommended for playwright-bdd.`,
      `Remove this option from defineBddConfig() and`,
      `Playwright's built-in loader will be used to compile TypeScript step definitions.`,
    );
  }
}
