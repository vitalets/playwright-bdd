/**
 * Generate playwright test files from Gherkin documents.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { TestFile } from './testFile';
import { loadConfig as loadCucumberConfig } from '../cucumber/loadConfig';
import { FeaturesLoader } from '../cucumber/loadFeatures';
import { hasTsNodeRegister, loadSteps } from '../cucumber/loadSteps';
import { extractCucumberConfig } from '../config';
import { Snippets } from '../snippets';
import { IRunConfiguration } from '@cucumber/cucumber/api';
import { appendDecoratorSteps } from '../steps/decorators/steps';
import { requireTransform } from '../playwright/transform';
import { getPlaywrightConfigDir } from '../config/configDir';
import { Logger } from '../utils/logger';
import parseTagsExpression from '@cucumber/tag-expressions';
import { exit, withExitHandler } from '../utils/exit';
import { hasCustomTest } from '../steps/createBdd';
import { ISupportCodeLibrary } from '../cucumber/types';
import { resovleFeaturePaths } from '../cucumber/resolveFeaturePaths';
import { loadStepsOwn } from '../cucumber/loadStepsOwn';
import { relativeToCwd } from '../utils/paths';
import { BDDConfig } from '../config/types';
import { appendNewCucumberStyleSteps } from '../steps/cucumberStyle';

export class TestFilesGenerator {
  // all these props are exist
  private runConfiguration!: IRunConfiguration;
  private featuresLoader = new FeaturesLoader();
  private supportCodeLibrary!: ISupportCodeLibrary;
  private files: TestFile[] = [];
  private tagsExpression?: ReturnType<typeof parseTagsExpression>;
  private logger: Logger;

  constructor(private config: BDDConfig) {
    this.logger = new Logger({ verbose: config.verbose });
    if (config.tags) this.tagsExpression = parseTagsExpression(config.tags);
  }

  async generate() {
    await withExitHandler(async () => {
      await this.loadCucumberConfig();
      await Promise.all([this.loadFeatures(), this.loadSteps()]);
      this.buildFiles();
      await this.checkUndefinedSteps();
      this.checkImportTestFrom();
      await this.clearOutputDir();
      await this.saveFiles();
    });
  }

  async extractSteps() {
    await this.loadCucumberConfig();
    await this.loadSteps();
    return this.supportCodeLibrary.stepDefinitions;
  }

  // todo: combine with extractSteps
  async extractUnusedSteps() {
    await this.loadCucumberConfig();
    await Promise.all([this.loadFeatures(), this.loadSteps()]);
    this.buildFiles();
    return this.supportCodeLibrary.stepDefinitions.filter((stepDefinition) => {
      const isUsed = this.files.some((file) => file.usedStepDefinitions.has(stepDefinition));
      return !isUsed;
    });
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

  private async loadFeatures() {
    const cwd = getPlaywrightConfigDir();
    const { defaultDialect } = this.runConfiguration.sources;
    const { featurePaths } = await resovleFeaturePaths(this.runConfiguration, { cwd });
    this.logger.log(`Loading features: ${featurePaths.length}`);
    featurePaths.forEach((featurePath) => this.logger.log(`  ${relativeToCwd(featurePath)}`));
    if (featurePaths.length) {
      await this.featuresLoader.load(featurePaths, { relativeTo: cwd, defaultDialect });
      this.handleParseErrors();
    }
  }

  private async loadSteps() {
    const { requirePaths = [], importPaths = [] } = this.runConfiguration.support;
    this.logger.log(`Loading steps: ${requirePaths.concat(importPaths).join(', ')}`);
    const environment = { cwd: getPlaywrightConfigDir() };
    this.supportCodeLibrary = this.config.steps
      ? await loadStepsOwn(environment.cwd, this.config.steps)
      : await loadSteps(this.runConfiguration, environment);
    await this.loadDecoratorSteps();
    appendNewCucumberStyleSteps(this.supportCodeLibrary);
    this.logger.log(`Loaded steps: ${this.supportCodeLibrary.stepDefinitions.length}`);
  }

  private async loadDecoratorSteps() {
    const { importTestFrom } = this.config;
    if (importTestFrom) {
      // require importTestFrom for case when it is not required by step definitions
      // possible re-require but it's not a problem as it is cached by Node.js
      await requireTransform().requireOrImport(importTestFrom.file);
      appendDecoratorSteps(this.supportCodeLibrary);
    }
  }

  private buildFiles() {
    this.files = this.featuresLoader
      .getDocumentsWithPickles()
      .map((gherkinDocument) => {
        return new TestFile({
          gherkinDocument,
          supportCodeLibrary: this.supportCodeLibrary,
          // doc.uri is always relative to cwd (coming after cucumber handling)
          // see: https://github.com/cucumber/cucumber-js/blob/main/src/api/gherkin.ts#L51
          outputPath: this.getSpecPathByFeaturePath(gherkinDocument.uri!),
          config: this.config,
          tagsExpression: this.tagsExpression,
        }).build();
      })
      .filter((file) => file.testCount > 0);
  }

  private getSpecPathByFeaturePath(relFeaturePath: string) {
    const configDir = getPlaywrightConfigDir();
    const absFeaturePath = path.resolve(configDir, relFeaturePath);
    const relOutputPath = path.relative(this.config.featuresRoot, absFeaturePath);
    if (relOutputPath.startsWith('..')) {
      exit(
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
      await snippets.print();
      exit();
    }
  }

  private checkImportTestFrom() {
    if (hasCustomTest && !this.config.importTestFrom) {
      exit(
        `When using custom "test" function in createBdd() you should`,
        `set "importTestFrom" config option that points to file exporting custom test.`,
      );
    }
  }

  private async saveFiles() {
    this.logger.log(`Generating Playwright tests: ${this.files.length}`);
    this.files.forEach((file) => {
      file.save();
      this.logger.log(`  ${relativeToCwd(file.outputPath)}`);
    });
  }

  private async clearOutputDir() {
    const pattern = `${fg.convertPathToPattern(this.config.outputDir)}/**/*.spec.js`;
    const testFiles = await fg(pattern);
    this.logger.log(`Clearing output dir: ${relativeToCwd(pattern)}`);
    const tasks = testFiles.map((testFile) => fs.rm(testFile));
    await Promise.all(tasks);
  }

  private warnForTsNodeRegister() {
    if (hasTsNodeRegister(this.runConfiguration)) {
      this.logger.warn(
        `WARNING: usage of requireModule: ['ts-node/register'] is not recommended for playwright-bdd.`,
        `Remove this option from defineBddConfig() and`,
        `Playwright's built-in loader will be used to compile TypeScript step definitions.`,
      );
    }
  }

  private handleParseErrors() {
    const { parseErrors } = this.featuresLoader;
    if (parseErrors.length) {
      const message = parseErrors
        .map((parseError) => {
          return `Parse error in "${parseError.source.uri}" ${parseError.message}`;
        })
        .join('\n');
      exit(message);
    }
  }
}
