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
import { exitWithMessage, getCommonPath } from '../utils';
import { Snippets } from '../snippets';
import { IRunConfiguration } from '@cucumber/cucumber/api';
import { appendDecoratorSteps } from '../stepDefinitions/createDecorators';
import { requireTransform } from '../playwright/transform';
import { getPlaywrightConfigDir } from '../config/dir';
import { logger } from '../utils/logger';
import parseTagsExpression from '@cucumber/tag-expressions';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export class TestFilesGenerator {
  // all these props are exist
  private runConfiguration!: IRunConfiguration;
  private features!: Map<GherkinDocument, Pickle[]>;
  private supportCodeLibrary!: ISupportCodeLibrary;
  private files: TestFile[] = [];
  private tagsExpression?: ReturnType<typeof parseTagsExpression>;

  constructor(private config: BDDConfig) {
    this.tagsExpression = config.tags ? parseTagsExpression(config.tags) : undefined;
  }

  async generate() {
    await this.loadCucumberConfig();
    await this.loadFeaturesAndSteps();
    this.buildFiles();
    await this.checkUndefinedSteps();
    this.checkImportCustomTest();
    await this.clearOutputDir();
    await this.saveFiles();
  }

  private async loadCucumberConfig() {
    const environment = { cwd: getPlaywrightConfigDir() };
    const { runConfiguration } = await loadCucumberConfig(
      {
        provided: extractCucumberConfig(this.config),
      },
      environment,
    );
    this.runConfiguration = runConfiguration;
    this.warnForTsNodeRegister();
  }

  private async loadFeaturesAndSteps() {
    const environment = { cwd: getPlaywrightConfigDir() };
    const [features, supportCodeLibrary] = await Promise.all([
      loadFeatures(this.runConfiguration, environment),
      loadSteps(this.runConfiguration, environment),
    ]);

    this.features = features;
    this.supportCodeLibrary = supportCodeLibrary;

    await this.loadDecoratorSteps();
  }

  async loadDecoratorSteps() {
    const { importTestFrom } = this.config;
    if (importTestFrom) {
      // require importTestFrom for case when it is not required by step definitions
      // possible re-require but it's not a problem as it is cached by Node.js
      await requireTransform().requireOrImport(importTestFrom.file);
      appendDecoratorSteps(this.supportCodeLibrary);
    }
  }

  private buildFiles() {
    const outputPaths = this.buildOutputPaths();
    this.files = [...this.features.entries()].map(([doc, pickles]) => {
      return new TestFile({
        doc,
        pickles,
        supportCodeLibrary: this.supportCodeLibrary,
        outputPath: outputPaths.get(doc)!,
        config: this.config,
        tagsExpression: this.tagsExpression,
      }).build();
    });
  }

  buildOutputPaths() {
    // these are always relative (coming after cucumber handling)
    const docs = [...this.features.keys()];
    const featurePaths = docs.map((doc) => doc.uri!);
    const commonPath = getCommonPath(featurePaths);
    const relativePaths = featurePaths.map((p) => path.relative(commonPath, p));
    const outputPaths = relativePaths.map((p) => path.join(this.config.outputDir, `${p}.spec.js`));
    return new Map(outputPaths.map((p, i) => [docs[i], p]));
  }

  private async checkUndefinedSteps() {
    const undefinedSteps = this.files.reduce((sum, file) => sum + file.undefinedSteps.length, 0);
    if (undefinedSteps > 0) {
      const snippets = new Snippets(this.files, this.runConfiguration, this.supportCodeLibrary);
      await snippets.printSnippetsAndExit();
    }
  }

  private checkImportCustomTest() {
    if (this.config.importTestFrom) return;
    const hasCustomTest = this.files.some((file) => file.hasCustomTest);
    if (hasCustomTest) {
      exitWithMessage(
        `When using custom "test" function in createBdd() you should`,
        `set "importTestFrom" config option that points to file exporting custom test.`,
      );
    }
  }

  async saveFiles() {
    this.files.forEach((file) => {
      file.save();
      if (this.config.verbose) {
        logger.log(`Generated: ${path.relative(process.cwd(), file.outputPath)}`);
      }
    });
    if (this.config.verbose) logger.log(`Generated files: ${this.files.length}`);
  }

  async clearOutputDir() {
    const testFiles = await fg(path.join(this.config.outputDir, '**', '*.spec.js'));
    const tasks = testFiles.map((testFile) => fs.rm(testFile));
    await Promise.all(tasks);
  }

  warnForTsNodeRegister() {
    if (hasTsNodeRegister(this.runConfiguration)) {
      logger.log(
        `WARNING: usage of requireModule: ['ts-node/register'] is not recommended for playwright-bdd.`,
        `Remove this option from defineBddConfig() and`,
        `Playwright's built-in loader will be used to compile TypeScript step definitions.`,
      );
    }
  }
}
