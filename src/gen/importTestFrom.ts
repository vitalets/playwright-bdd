/**
 * Guess import test from by used steps.
 */

import { isTestContainsSubtest } from '../playwright/testTypeImpl';
import { TestTypeCommon } from '../playwright/types';
import { findExportedTestWithFixture, getExportedTest } from '../steps/exportedTest';
import { StepDefinition } from '../steps/registry';
import { exit } from '../utils/exit';
import { ImportTestFrom } from './formatter';

export function guessImportTestFrom(
  featureUri: string,
  usedStepDefinitions: Set<StepDefinition>,
  usedDecoratorFixtures: Set<string>,
): ImportTestFrom | undefined {
  const usedCustomTests = getUsedCustomTests(usedStepDefinitions, usedDecoratorFixtures);
  // todo: if usedCustomTests > 0 and exportedTest === 0 -> speciall error msg

  let topmostTest = usedCustomTests[0];
  for (let i = 1; i < usedCustomTests.length; i++) {
    const higherTest = selectHigherTestInstance(topmostTest, usedCustomTests[i]);
    if (!higherTest) {
      // todo: more details in message
      exit(
        [
          `Can't guess test instance for: ${featureUri}`,
          `Found ${usedCustomTests.length} test instances, but they should extending each other.`,
          `Please check BDD configuration "steps" or set "importTestFrom" manually.`,
        ].join('\n'),
      );
    }
    topmostTest = higherTest;
  }

  // for default playwright-bdd baseTest -> topmostTest will be undefined
  if (!topmostTest) return;

  const exportedTest = getExportedTest(topmostTest)!;
  if (!exportedTest) {
    exit(
      [
        `Can't guess test instance for: ${featureUri}`,
        `Did you include fixtures file in BDD configuration "steps"?`,
      ].join('\n'),
    );
  }

  return { file: exportedTest.file, varName: exportedTest.varName };
}

// todo: split on two functions
function getUsedCustomTests(
  stepDefinitions: Set<StepDefinition>,
  usedDecoratorFixtures: Set<string>,
) {
  const set = new Set<TestTypeCommon>();

  stepDefinitions.forEach(({ stepConfig }) => {
    if (stepConfig.customTest) set.add(stepConfig.customTest);
  });

  usedDecoratorFixtures.forEach((fixtureName) => {
    const exportedTest = findExportedTestWithFixture(fixtureName);
    if (!exportedTest) {
      exit(
        `Can't find file that exports Playwright test with decorator fixture "${fixtureName}".`,
        `Please check BDD configuration "steps".`,
      );
    }
    set.add(exportedTest.testInstance);
  });

  return [...set];
}

function selectHigherTestInstance(test1: TestTypeCommon, test2: TestTypeCommon) {
  if (isTestContainsSubtest(test1, test2)) return test1;
  if (isTestContainsSubtest(test2, test1)) return test2;
  // Provided tests are no in parent-child relation
}
