/**
 * Generate playwright test files from Gherkin documents.
 */
import fs from 'node:fs';
import fg from 'fast-glob';
import { TestFile } from './file';
import { FeaturesLoader, resolveFeatureFiles } from '../features/load';
import { Snippets } from '../snippets';
import { Logger } from '../utils/logger';
import parseTagsExpression from '@cucumber/tag-expressions';
import { exit, withExitHandler } from '../utils/exit';
import { loadSteps, loadStepsFromFile, resolveStepFiles } from '../steps/loader';
import { relativeToCwd } from '../utils/paths';
import { BDDConfig } from '../config/types';
import { stepDefinitions } from '../steps/stepRegistry';
import { saveFileSync } from '../utils';
import { MissingStep } from '../snippets/types';
import { StepDefinition } from '../steps/stepDefinition';

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
      this.checkMissingSteps();
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
    const allUsedDefinitions = this.files.reduce((acc, file) => {
      file.getUsedDefinitions().forEach((definition) => acc.add(definition));
      return acc;
    }, new Set<StepDefinition>());
    return stepDefinitions.filter((stepDefinition) => {
      return !allUsedDefinitions.has(stepDefinition);
    });
  }

  private async loadFeatures() {
    const { configDir, features, language } = this.config;
    const featureFiles = await resolveFeatureFiles(configDir, features);
    this.logger.log(`Loading features: ${features}`);
    this.logger.log(`Resolved feature files: ${featureFiles.length}`);
    featureFiles.forEach((featureFile) => this.logger.log(`  ${relativeToCwd(featureFile)}`));
    await this.featuresLoader.load(featureFiles, {
      relativeTo: configDir,
      defaultDialect: language,
    });
    this.handleFeatureParseErrors();
  }

  private async loadSteps() {
    const { configDir, steps } = this.config;
    this.logger.log(`Loading steps: ${steps}`);
    const stepFiles = await resolveStepFiles(configDir, steps);
    this.logger.log(`Resolved step files: ${stepFiles.length}`);
    stepFiles.forEach((stepFiles) => this.logger.log(`  ${relativeToCwd(stepFiles)}`));
    await loadSteps(stepFiles);
    this.logger.log(`Loaded steps: ${stepDefinitions.length}`);
    await this.handleImportTestFrom();
  }

  private buildFiles() {
    this.files = this.featuresLoader
      .getDocumentsWithPickles()
      .map((gherkinDocument) => {
        return new TestFile({
          config: this.config,
          gherkinDocument,
          tagsExpression: this.tagsExpression,
        }).build();
      })
      .filter((file) => file.hasExecutableTests());
  }

  private checkMissingSteps() {
    if (this.config.missingSteps !== 'fail-on-gen') return;
    const missingSteps: MissingStep[] = [];
    this.files.forEach((file) => missingSteps.push(...file.getMissingSteps()));
    if (missingSteps.length) {
      new Snippets(missingSteps).print();
      exit();
    }
  }

  private async handleImportTestFrom() {
    const { importTestFrom } = this.config;
    if (!importTestFrom) return;
    // require importTestFrom separately instead of just adding to steps,
    // b/c we need additionally check that it exports "test" variable.
    // If checking by together loaded files, it's become messy to find correct file by url,
    // b/c of win/posix path separator.
    const exportedTests = await loadStepsFromFile(importTestFrom.file);
    const varName = importTestFrom.varName || 'test';
    if (!exportedTests.find((info) => info.varName === varName)) {
      exit(
        `File "${relativeToCwd(importTestFrom.file)}" pointed by "importTestFrom"`,
        `should export "${varName}" variable.`,
      );
    }
  }

  private async saveFiles() {
    this.logger.log(`Generating Playwright tests: ${this.files.length}`);
    this.files.forEach((file) => {
      saveFileSync(file.outputPath, file.content);
      this.logger.log(`  ${relativeToCwd(file.outputPath)}`);
    });
  }

  private async clearOutputDir() {
    const pattern = `${fg.convertPathToPattern(this.config.outputDir)}/**/*.spec.js`;
    const testFiles = await fg(pattern);
    this.logger.log(`Clearing output dir: ${relativeToCwd(pattern)}`);
    const tasks = testFiles.map((testFile) => fs.promises.rm(testFile));
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
