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
import { exitWithMessage } from '../utils';
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
    if (config.tags) this.tagsExpression = parseTagsExpression(config.tags);
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
    this.files = [...this.features.entries()]
      .map(([doc, pickles]) => {
        return new TestFile({
          doc,
          pickles,
          supportCodeLibrary: this.supportCodeLibrary,
          outputPath: this.getOutputPath(doc),
          config: this.config,
          tagsExpression: this.tagsExpression,
        }).build();
      })
      .filter((file) => file.testNodes.length > 0);
  }

  private getOutputPath(doc: GherkinDocument) {
    const configDir = getPlaywrightConfigDir();
    // doc.uri is always relative to cwd (coming after cucumber handling)
    // see: https://github.com/cucumber/cucumber-js/blob/main/src/api/gherkin.ts#L51
    const relFeaturePath = doc.uri!;
    const absFeaturePath = path.resolve(configDir, relFeaturePath);
    const relOutputPath = path.relative(this.config.featuresRoot, absFeaturePath);
    if (relOutputPath.startsWith('..')) {
      exitWithMessage(
        `All feature files should be located underneath featuresRoot.`,
        `Please change featuresRoot or paths in configuration.\n`,
        `featureFile: ${absFeaturePath}\n`,
        `featuresRoot: ${this.config.featuresRoot}\n`,
      );
    }
    const absOutputPath = path.resolve(this.config.outputDir, relOutputPath);
    return `${absOutputPath}.spec.js`;
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
