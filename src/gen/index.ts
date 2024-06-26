/**
 * Generate playwright test files from Gherkin documents.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { TestFile } from './testFile';
import { FeaturesLoader, resolveFeatureFiles } from '../cucumber/loadFeatures';
// import { Snippets } from '../snippets';
import { requireTransform } from '../playwright/transform';
import { getPlaywrightConfigDir } from '../config/configDir';
import { Logger } from '../utils/logger';
import parseTagsExpression from '@cucumber/tag-expressions';
import { exit, withExitHandler } from '../utils/exit';
import { hasCustomTest } from '../steps/createBdd';
import { resolveAndLoadSteps } from '../cucumber/loadStepsOwn';
import { relativeToCwd } from '../utils/paths';
import { BDDConfig } from '../config/types';
import { stepDefinitions } from '../steps/registry';

export class TestFilesGenerator {
  private featuresLoader = new FeaturesLoader();
  private files: TestFile[] = [];
  private tagsExpression?: ReturnType<typeof parseTagsExpression>;
  private logger: Logger;

  constructor(private config: BDDConfig) {
    this.logger = new Logger({ verbose: config.verbose });
    if (config.tags) this.tagsExpression = parseTagsExpression(config.tags);
  }

  async generate() {
    await withExitHandler(async () => {
      await Promise.all([this.loadFeatures(), this.loadSteps()]);
      this.buildFiles();
      await this.checkUndefinedSteps();
      this.checkImportTestFrom();
      await this.clearOutputDir();
      await this.saveFiles();
    });
  }

  async extractSteps() {
    await this.loadSteps();
    return stepDefinitions;
  }

  // todo: combine with extractSteps
  async extractUnusedSteps() {
    await Promise.all([this.loadFeatures(), this.loadSteps()]);
    this.buildFiles();
    return stepDefinitions.filter((stepDefinition) => {
      const isUsed = this.files.some((file) => file.usedStepDefinitions.has(stepDefinition));
      return !isUsed;
    });
  }

  private async loadFeatures() {
    const cwd = getPlaywrightConfigDir();
    const featureFiles = await resolveFeatureFiles(cwd, this.config.features);
    this.logger.log(`Loading features: ${featureFiles.length} (${this.config.features})`);
    featureFiles.forEach((featureFile) => this.logger.log(`  ${relativeToCwd(featureFile)}`));
    await this.featuresLoader.load(featureFiles, {
      relativeTo: cwd,
      defaultDialect: this.config.language,
    });
    this.handleFeatureParseErrors();
  }

  private async loadSteps() {
    const cwd = getPlaywrightConfigDir();
    this.logger.log(`Loading steps: ${this.config.steps}`);
    await resolveAndLoadSteps(cwd, this.config.steps);
    await this.loadDecoratorStepsViaImportTestFrom();
    this.logger.log(`Loaded steps: ${stepDefinitions.length}`);
  }

  private async loadDecoratorStepsViaImportTestFrom() {
    const { importTestFrom } = this.config;
    if (importTestFrom) {
      // require importTestFrom for case when it is not required by step definitions
      // possible re-require but it's not a problem as it is cached by Node.js
      await requireTransform().requireOrImport(importTestFrom.file);
    }
  }

  private buildFiles() {
    this.files = this.featuresLoader
      .getDocumentsWithPickles()
      .map((gherkinDocument) => {
        return new TestFile({
          gherkinDocument,
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
    const lines: string[] = [];
    this.files.forEach((file) => {
      if (!file.undefinedSteps.length) return;
      lines.push(`* ${file.featureUri}`);
      file.undefinedSteps.forEach((step) => lines.push(` - ${step.pickleStep.text}`));
    });
    if (lines.length) {
      lines.unshift(`Undefined steps found!`);
      exit();
    }
    // temporary simplify snippets
    // todo: just print snippets without dynamically loading external files
    // const undefinedSteps = this.files.reduce((sum, file) => sum + file.undefinedSteps.length, 0);
    // if (undefinedSteps > 0) {
    //   const snippets = new Snippets(this.files, this.supportCodeLibrary);
    //   await snippets.print();
    //   exit();
    // }
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

  private handleFeatureParseErrors() {
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
