/**
 * Builds cucumber messages and provides them as stream.
 * Used as a singleton.
 */

import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { FeaturesLoader } from '../../cucumber/loadFeatures';
import { getPlaywrightConfigDir } from '../../config/dir';
import { TestCaseRun } from './TestCaseRun';
import { TestCaseBuilder } from './TestCase';
import { Meta } from './Meta';
import { TimeMeasured, calcMinMaxByArray, toCucumberTimestamp } from './timing';

export class CucumberMessagesBuilder {
  static instance: CucumberMessagesBuilder;
  static referenceCount = 0;
  static getInstance() {
    if (!this.instance) this.instance = new CucumberMessagesBuilder();
    this.referenceCount++;
    return this.instance;
  }

  private messages: messages.Envelope[] = [];
  private fullResult!: pw.FullResult;
  private testCaseRuns: TestCaseRun[] = [];
  private testCases = new Map</* testId */ string, messages.TestCase>();
  private featuresLoader = new FeaturesLoader();
  private _fullResultTiming?: TimeMeasured;

  onTestEnd(test: pw.TestCase, result: pw.TestResult) {
    this.testCaseRuns.push(new TestCaseRun(test, result));
  }

  onEnd(result: pw.FullResult) {
    this.fullResult = result;
  }

  async buildMessages() {
    // wait test end
    // wrap as a single promise
    await this.loadFeatures();

    this.addMeta();
    this.addSources();
    this.addGherkinDocuments();
    this.addPickles();
    this.addTestRunStarted();
    this.addTestCases();
    this.addTestCaseRuns();
    this.addTestRunFinished();

    // console.log(this.messages)
  }

  private addMeta() {
    this.messages.push(new Meta().buildMessage());
  }

  private addSources() {
    const messages = this.featuresLoader.gherkinQuery.getSources().map((source) => ({ source }));
    this.messages.push(...messages);
  }

  private addGherkinDocuments() {
    const messages = this.featuresLoader.gherkinQuery
      .getGherkinDocuments()
      .map((gherkinDocument) => ({ gherkinDocument }));
    this.messages.push(...messages);
  }

  private addPickles() {
    const messages = this.featuresLoader.gherkinQuery.getPickles().map((pickle) => ({ pickle }));
    this.messages.push(...messages);
  }

  private addTestCases() {
    const docs = this.featuresLoader.getDocumentsWithPickles();
    this.testCaseRuns.forEach((testCaseRun) => {
      let testCase = this.testCases.get(testCaseRun.test.id);
      if (!testCase) {
        testCase = new TestCaseBuilder(testCaseRun, docs).build();
        this.testCases.set(testCaseRun.test.id, testCase);
        this.messages.push({ testCase });
      }
      testCaseRun.testCase = testCase;
    });
  }

  private addTestCaseRuns() {
    this.testCaseRuns.map((testCaseRun) => {
      const messages = testCaseRun.buildMessages();
      this.messages.push(...messages);
    });
  }

  private addTestRunStarted() {
    const { startTime } = this.getFullResultTiming();
    const testRunStarted: messages.TestRunStarted = {
      timestamp: toCucumberTimestamp(startTime.getTime()),
    };
    this.messages.push({ testRunStarted });
  }

  private addTestRunFinished() {
    const { startTime, duration } = this.getFullResultTiming();
    const testRunFinished: messages.TestRunFinished = {
      success: this.fullResult.status === 'passed',
      timestamp: toCucumberTimestamp(startTime.getTime() + duration),
    };
    this.messages.push({ testRunFinished });
  }

  private getFeaturePaths() {
    const featurePaths = new Set<string>();
    this.testCaseRuns.forEach((testCaseRun) => featurePaths.add(testCaseRun.bddData.uri));
    return [...featurePaths];
  }

  private async loadFeatures() {
    const cwd = getPlaywrightConfigDir();
    const featurePaths = this.getFeaturePaths();
    await this.featuresLoader.load(featurePaths, { relativeTo: cwd });
  }

  private getFullResultTiming() {
    if (this._fullResultTiming) return this._fullResultTiming;
    // result.startTime and result.duration were added in pw 1.37
    // see: https://github.com/microsoft/playwright/pull/26760
    if ('startTime' in this.fullResult && 'duration' in this.fullResult) {
      this._fullResultTiming = {
        startTime: this.fullResult.startTime as Date,
        duration: this.fullResult.duration as number,
      };
    } else {
      // Calculate overall startTime and duration based on test timings
      const items = this.testCaseRuns.map((t) => t.result);
      this._fullResultTiming = calcMinMaxByArray(items);
    }

    return this._fullResultTiming;
  }
}
