/**
 * Cucumber junit reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/junit_formatter.ts
 * Junit spec(ish): https://github.com/testmoapp/junitxml
 * See also: https://github.com/cucumber/cucumber-junit-xml-formatter
 * See also: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/reporters/junit.ts
 */

/* eslint-disable visual/complexity, max-lines, max-statements */

import xmlbuilder from 'xmlbuilder';
import * as messages from '@cucumber/messages';
import {
  Attachment,
  Duration,
  getWorstTestStepResult,
  Pickle,
  Rule,
  TestStepResult,
  TestStepResultStatus,
} from '@cucumber/messages';
import BaseReporter, { InternalOptions } from './base';
import { doesHaveValue, valueOrDefault } from '../../cucumber/valueChecker';
import { ITestCaseAttempt } from '../../cucumber/formatter/EventDataCollector';
import {
  getGherkinExampleRuleMap,
  getGherkinStepMap,
} from '../../cucumber/formatter/GherkinDocumentParser';
import { getPickleStepMap, getStepKeyword } from '../../cucumber/formatter/PickleParser';
import { GherkinDocumentMessage } from './messagesBuilder/GherkinDocument';
import { getFeatureNameWithProject, TITLE_SEPARATOR } from './messagesBuilder/Projects';

type JunitReporterOptions = {
  outputFile?: string;
  suiteName?: string;
};

interface IJUnitTestSuite {
  name: string;
  failures: number;
  skipped: number;
  time: number;
  tests: IJUnitTestCase[];
}

interface IJUnitTestCase {
  classname: string;
  name: string;
  time: number;
  result: IJUnitTestCaseResult;
  systemOutput: string;
  steps: IJUnitTestStep[];
}

interface IJUnitTestCaseFailure {
  type: string;
  message?: string;
  detail: string;
}

interface IJUnitTestCaseResult {
  status: TestStepResultStatus;
  failure?: IJUnitTestCaseFailure;
}

interface IJUnitTestStep {
  attachments: Attachment[];
  hidden: boolean;
  keyword: string;
  line: number;
  name?: string;
  result: TestStepResult;
  time: number;
}

interface IBuildJUnitTestStepOptions {
  isBeforeHook: boolean;
  gherkinStepMap: Record<string, messages.Step>;
  pickleStepMap: Record<string, messages.PickleStep>;
  testStep: messages.TestStep;
  testStepAttachments: messages.Attachment[];
  testStepResult: messages.TestStepResult;
}

export default class JunitReporter extends BaseReporter {
  private readonly names: Record<string, string[]> = {};

  constructor(
    internalOptions: InternalOptions,
    protected userOptions: JunitReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.onTestRunFinished();
      }
    });
  }

  get suiteName() {
    return valueOrDefault(this.userOptions.suiteName, 'cucumber-js');
  }

  private getTestCases() {
    return this.eventDataCollector
      .getTestCaseAttempts()
      .filter((attempt) => !attempt.willBeRetried);
  }

  private getTestSteps(
    testCaseAttempt: ITestCaseAttempt,
    gherkinStepMap: Record<string, messages.Step>,
    pickleStepMap: Record<string, messages.PickleStep>,
  ) {
    return testCaseAttempt.testCase.testSteps.map((testStep) => {
      const isBeforeHook = !doesHaveValue(testStep.pickleStepId);
      return this.getTestStep({
        isBeforeHook,
        gherkinStepMap,
        pickleStepMap,
        testStep,
        testStepAttachments: testCaseAttempt.stepAttachments[testStep.id],
        testStepResult: testCaseAttempt.stepResults[testStep.id],
      });
    });
  }

  private getTestStep({
    isBeforeHook,
    gherkinStepMap,
    pickleStepMap,
    testStep,
    testStepAttachments,
    testStepResult,
  }: IBuildJUnitTestStepOptions): IJUnitTestStep {
    const data: Partial<IJUnitTestStep> = {};
    if (testStep.pickleStepId) {
      const pickleStep = pickleStepMap[testStep.pickleStepId];
      data.keyword = getStepKeyword({ pickleStep, gherkinStepMap });
      data.line = gherkinStepMap[pickleStep.astNodeIds[0]].location.line;
      data.name = pickleStep.text;
    } else {
      data.keyword = isBeforeHook ? 'Before' : 'After';
      data.hidden = true;
    }
    data.result = testStepResult;
    data.time = testStepResult.duration ? this.durationToSeconds(testStepResult.duration) : 0;
    data.attachments = testStepAttachments;
    return data as IJUnitTestStep;
  }

  private getTestCaseResult(steps: IJUnitTestStep[]): IJUnitTestCaseResult {
    const { status, message, exception } = getWorstTestStepResult(steps.map((step) => step.result));
    return {
      status,
      failure:
        message || exception
          ? {
              type: exception?.type || '',
              message: exception?.message,
              detail: message || '',
            }
          : undefined,
    };
  }

  private durationToSeconds(duration: Duration): number {
    const NANOS_IN_SECOND = 1_000_000_000;
    return (duration.seconds * NANOS_IN_SECOND + duration.nanos) / NANOS_IN_SECOND;
  }

  private nameOrDefault(name: string | undefined, fallbackSuffix: string): string {
    if (!name) {
      return `(unnamed ${fallbackSuffix})`;
    }
    return name;
  }

  private getTestCaseName(featureName: string, rule: Rule | undefined, pickle: Pickle) {
    const pickleName = this.nameOrDefault(pickle.name, 'scenario');
    const testCaseName = [
      featureName,
      rule ? this.nameOrDefault(rule.name, 'rule') : '',
      pickleName,
    ]
      .filter(Boolean)
      .join(TITLE_SEPARATOR);
    if (!this.names[featureName]) {
      this.names[featureName] = [];
    }
    let index = 0;
    while (
      this.names[featureName].includes(index > 0 ? `${testCaseName} [${index}]` : testCaseName)
    ) {
      index++;
    }
    const name = index > 0 ? `${testCaseName} [${index}]` : testCaseName;
    this.names[featureName].push(name);
    return name;
  }

  private formatTestSteps(steps: IJUnitTestStep[]): string {
    return steps
      .filter((step) => !step.hidden)
      .map((step) => {
        const statusText = step.result.status.toLowerCase();
        const maxLength = 80 - statusText.length - 3;
        const stepText = `${step.keyword}${step.name}`
          .padEnd(maxLength, '.')
          .substring(0, maxLength);
        return `${stepText}...${statusText}`;
      })
      .join('\n');
  }

  private onTestRunFinished(): void {
    const testCases = this.getTestCases();

    const tests = testCases.map<IJUnitTestCase>((testCaseAttempt: ITestCaseAttempt) => {
      const { gherkinDocument, pickle } = testCaseAttempt;
      const { feature } = gherkinDocument;
      if (!feature) {
        throw new Error(`Gherkin document without feature: ${gherkinDocument.uri}`);
      }
      const meta = GherkinDocumentMessage.extractMeta(gherkinDocument);
      const gherkinExampleRuleMap = getGherkinExampleRuleMap(gherkinDocument);
      const rule = gherkinExampleRuleMap[pickle.astNodeIds[0]];
      const gherkinStepMap = getGherkinStepMap(gherkinDocument);
      const pickleStepMap = getPickleStepMap(pickle);

      const steps = this.getTestSteps(testCaseAttempt, gherkinStepMap, pickleStepMap);
      const stepDuration = steps.reduce((total, step) => total + (step.time || 0), 0);

      const featureName = this.nameOrDefault(feature.name, 'feature');
      const featureNameWithProject = getFeatureNameWithProject(meta.projectName, featureName);
      return {
        classname: featureName,
        // always add project to testcase name
        // see: https://github.com/microsoft/playwright/issues/23432
        name: this.getTestCaseName(featureNameWithProject, rule, pickle),
        time: stepDuration,
        result: this.getTestCaseResult(steps),
        systemOutput: this.formatTestSteps(steps),
        steps,
      };
    });

    const passed = tests.filter(
      (item) => item.result.status === TestStepResultStatus.PASSED,
    ).length;
    const skipped = tests.filter(
      (item) => item.result.status === TestStepResultStatus.SKIPPED,
    ).length;
    const failures = tests.length - passed - skipped;

    const testSuite: IJUnitTestSuite = {
      name: this.suiteName,
      tests,
      failures,
      skipped,
      time: tests.reduce((total, test) => total + test.time, 0),
    };

    this.outputStream.write(this.buildXmlReport(testSuite));
  }

  private buildXmlReport(testSuite: IJUnitTestSuite): string {
    const xmlReport = xmlbuilder
      .create('testsuite', { encoding: 'UTF-8', invalidCharReplacement: '' })
      .att('failures', testSuite.failures)
      .att('skipped', testSuite.skipped)
      .att('name', testSuite.name)
      .att('time', testSuite.time)
      .att('tests', testSuite.tests.length);

    testSuite.tests.forEach((test) => {
      const xmlTestCase = xmlReport.ele('testcase', {
        classname: test.classname,
        name: test.name,
        time: test.time,
      });
      if (test.result.status === TestStepResultStatus.SKIPPED) {
        xmlTestCase.ele('skipped');
      } else if (test.result.status !== TestStepResultStatus.PASSED) {
        const xmlFailure = xmlTestCase.ele('failure', {
          type: test.result.failure?.type,
          message: test.result.failure?.message,
        });
        if (test.result?.failure) {
          xmlFailure.cdata(test.result.failure.detail);
        }
      }
      xmlTestCase.ele('system-out', {}).cdata(test.systemOutput);
    });

    return xmlReport.end({ pretty: true });
  }
}
