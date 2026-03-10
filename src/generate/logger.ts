/**
 * Logging helper, separate from the main codebase.
 */

import { StepDefinition } from '../steps/stepDefinition';
import { Logger } from '../utils/logger';
import { relativeToCwd, toPosixPath } from '../utils/paths';
import { TestFile } from './file';

export class TestFilesGeneratorLogger extends Logger {
  logLoadingFeatures(files: string[], finalPatterns: string[]) {
    if (!this.enabled) return;
    this.log(`Checking feature files at:`);
    finalPatterns.forEach((pattern) => this.log(`  - ${pattern}`));
    this.log(`Found feature files (${files.length}):`);
    files.forEach((featureFile) => this.log(`  - ${relativeToCwd(featureFile)}`));
  }

  logLoadingSteps(files: string[], finalPatterns: string[]) {
    if (!this.enabled) return;
    this.log(`Checking step files at:`);
    finalPatterns.forEach((pattern) => this.log(`  - ${pattern}`));
    this.log(`Found step files (${files.length}):`);
  }

  logLoadedSteps(files: string[], stepDefinitions: StepDefinition[]) {
    if (!this.enabled) return;
    files.forEach((stepFile) => {
      const normalizedStepFile = toPosixPath(stepFile);
      const definitions = stepDefinitions.filter(
        (definition) => toPosixPath(definition.uri) === normalizedStepFile,
      );
      const suffix = definitions.length === 1 ? 'step' : 'steps';
      this.log(`  - ${relativeToCwd(stepFile)} (${definitions.length} ${suffix})`);
    });
  }

  logGeneratedTestFiles(files: TestFile[]) {
    if (!this.enabled) return;
    this.log(`Generating Playwright test files (${files.length}):`);
    files.forEach((file) => this.log(`  - ${relativeToCwd(file.outputPath)}`));
  }

  logClearingOutputDir(pattern: string) {
    this.log(`Clearing output directory: ${relativeToCwd(pattern)}`);
  }
}
