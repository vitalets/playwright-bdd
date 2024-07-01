/**
 * Guess import test from by used steps.
 */

import { isTestContainsSubtest } from '../playwright/testTypeImpl';
import { TestTypeCommon } from '../playwright/types';
import {
  findExportedTestWithFixture,
  getExportedTest,
  getExportedTestsCount,
} from '../steps/exportedTest';
import { StepDefinition } from '../steps/registry';
import { exit } from '../utils/exit';
import { ImportTestFrom } from './formatter';

export class ImportTestFromGuesser {
  private customTestsSet = new Set<TestTypeCommon>();

  constructor(
    private featureUri: string,
    private usedStepDefinitions: Set<StepDefinition>,
    private usedDecoratorFixtures: Set<string>,
  ) {}

  guess(): ImportTestFrom | undefined {
    this.fillCustomTestsFromRegularSteps();
    this.fillCustomTestsFromDecoratorSteps();
    this.exitIfNoExportedTests();
    const customTests = [...this.customTestsSet];
    const topmostTest = this.findTopmostTest(customTests);
    // for default playwright-bdd baseTest -> topmostTest will be undefined
    if (!topmostTest) return;
    const { file, varName } = this.getExportedTest(topmostTest);
    return { file, varName };
  }

  private fillCustomTestsFromRegularSteps() {
    this.usedStepDefinitions.forEach(({ stepConfig }) => {
      if (stepConfig.customTest) this.customTestsSet.add(stepConfig.customTest);
    });
  }

  private fillCustomTestsFromDecoratorSteps() {
    this.usedDecoratorFixtures.forEach((fixtureName) => {
      const exportedTest = findExportedTestWithFixture(fixtureName);
      if (!exportedTest) {
        exit(
          `Can't guess test instance for decorator fixture "${fixtureName}".`,
          `Please add fixtures file to BDD configuration "steps" or set "importTestFrom" manually.`,
        );
      }
      this.customTestsSet.add(exportedTest.testInstance);
    });
  }

  private exitIfNoExportedTests() {
    if (this.customTestsSet.size > 0 && getExportedTestsCount() === 0) {
      exit(
        `Can't guess test instance for: ${this.featureUri}.`,
        `Your tests use custom test instance, produced by test.extend().`,
        `Please add file exporting custom test to BDD configuration "steps" or set "importTestFrom" manually.`,
      );
    }
  }

  private findTopmostTest(customTests: TestTypeCommon[]) {
    let topmostTest = customTests[0];

    for (let i = 1; i < customTests.length; i++) {
      const higherTest = selectHigherTestInstance(topmostTest, customTests[i]);
      if (!higherTest) {
        exit(
          `Can't guess test instance for: ${this.featureUri}.`,
          `Found ${customTests.length} test instances, but they should extending each other.`,
          `Please check BDD configuration "steps" or set "importTestFrom" manually.`,
        );
      }
      topmostTest = higherTest;
    }

    return topmostTest;
  }

  private getExportedTest(customTest: TestTypeCommon) {
    const exportedTest = getExportedTest(customTest)!;
    if (!exportedTest) {
      exit(
        `Can't guess test instance for: ${this.featureUri}.`,
        `Did you include fixtures file in BDD configuration "steps"?`,
      );
    }
    return exportedTest;
  }
}

function selectHigherTestInstance(test1: TestTypeCommon, test2: TestTypeCommon) {
  if (isTestContainsSubtest(test1, test2)) return test1;
  if (isTestContainsSubtest(test2, test1)) return test2;
  // Provided tests are no in parent-child relation
}
