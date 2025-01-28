/**
 * Guess import test from by used steps.
 */

import { isTestContainsSubtest } from '../playwright/testTypeImpl';
import { TestTypeCommon } from '../playwright/types';
import {
  findExportedTestWithFixture,
  getExportedTestInfo,
  getExportedTestsCount,
} from '../steps/exportedTest';
import { StepDefinition } from '../steps/stepDefinition';
import { exit } from '../utils/exit';
import { ImportTestFrom } from './formatter';

// todo: refactor to fill this class in-place, instead of collecting data
export class ImportTestGuesser {
  private customTestsSet: Set<TestTypeCommon>;

  // eslint-disable-next-line max-params
  constructor(
    private featureUri: string,
    private usedStepDefinitions: Set<StepDefinition>,
    private usedDecoratorFixtures: Set<string>,
    customTestsFromHooks: Set<TestTypeCommon>,
  ) {
    this.customTestsSet = new Set([...customTestsFromHooks]);
  }

  guess(): ImportTestFrom | undefined {
    this.fillCustomTestsFromRegularSteps();
    this.fillCustomTestsFromDecoratorSteps();
    if (!this.hasCustomTests()) return;
    if (getExportedTestsCount() === 0) this.throwCantGuessError();
    // topmostTest must exist as we checked tests count above
    const topmostTest = this.findTopmostTest()!;
    const { file, varName } = this.getExportedTestInfo(topmostTest);
    return { file, varName };
  }

  private fillCustomTestsFromRegularSteps() {
    this.usedStepDefinitions.forEach(({ customTest }) => {
      if (customTest) this.customTestsSet.add(customTest);
    });
  }

  private fillCustomTestsFromDecoratorSteps() {
    this.usedDecoratorFixtures.forEach((fixtureName) => {
      const exportedTest = findExportedTestWithFixture(fixtureName);
      if (!exportedTest) {
        exit(
          `Can't guess test instance for decorator fixture "${fixtureName}".`,
          `Please ensure that "${fixtureName}" is defined in test.extend()`,
          `and "steps" pattern in config covers files with decorator steps.`,
        );
      }
      this.customTestsSet.add(exportedTest.testInstance);
    });
  }

  private hasCustomTests() {
    return this.customTestsSet.size > 0;
  }

  private findTopmostTest() {
    const customTests = [...this.customTestsSet];
    let topmostTest = customTests[0];

    for (let i = 1; i < customTests.length; i++) {
      const customTest = customTests[i];
      const higherTest = selectHigherTestInstance(topmostTest, customTest);
      // todo: uncomment for noUncheckedIndexedAccess
      // const higherTest =
      //   topmostTest && customTest
      //     ? selectHigherTestInstance(topmostTest, customTest)
      //     : topmostTest || customTest;
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

  private getExportedTestInfo(customTest: TestTypeCommon) {
    const info = getExportedTestInfo(customTest)!;
    if (!info) this.throwCantGuessError();
    return info;
  }

  private throwCantGuessError() {
    exit(
      `Can't guess test instance for: ${this.featureUri}.`,
      `Your tests use custom test instance, produced by base.extend().`,
      `Please check that:\n`,
      `- fixtures file exports "test" variable\n`,
      `- fixtures file is included in BDD configuration "steps" option\n`,
      `If it does not help, try to set "importTestFrom" option manually.`,
    );
  }
}

function selectHigherTestInstance(test1: TestTypeCommon, test2: TestTypeCommon) {
  if (isTestContainsSubtest(test1, test2)) return test1;
  if (isTestContainsSubtest(test2, test1)) return test2;
  // Provided tests are not in parent-child relation
}
