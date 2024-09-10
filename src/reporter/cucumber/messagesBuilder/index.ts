/**
 * Builds cucumber messages from Playwright test results.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { TestCaseRun, TestCaseRunEnvelope } from './TestCaseRun';
import { TestCase } from './TestCase';
import { Meta } from './Meta';
import { TimeMeasured, calcMinMaxByArray, toCucumberTimestamp } from './timing';
import EventEmitter from 'node:events';
import EventDataCollector from '../../../cucumber/formatter/EventDataCollector.js';
import { Hook } from './Hook';
import { AutofillMap } from '../../../utils/AutofillMap.js';
import { GherkinDocuments } from './GherkinDocuments';
import { Pickles } from './Pickles';
import { ConcreteEnvelope } from './types';
import { hasBddConfig } from '../../../config/env.js';

export class MessagesBuilder {
  private report = {
    meta: null as ConcreteEnvelope<'meta'>,
    source: [] as ConcreteEnvelope<'source'>[],
    gherkinDocument: [] as ConcreteEnvelope<'gherkinDocument'>[],
    pickle: [] as ConcreteEnvelope<'pickle'>[],
    stepDefinition: [] as ConcreteEnvelope<'stepDefinition'>[],
    hook: [] as ConcreteEnvelope<'hook'>[],
    testRunStarted: null as ConcreteEnvelope<'testRunStarted'>,
    testCase: [] as ConcreteEnvelope<'testCase'>[],
    testCaseRuns: [] as TestCaseRunEnvelope[],
    testRunFinished: null as ConcreteEnvelope<'testRunFinished'>,
  };

  private fullConfig!: pw.FullConfig;
  private fullResult!: pw.FullResult;
  private testCaseRuns: TestCaseRun[] = [];
  private testCases = new AutofillMap</* testId */ string, TestCase>();
  private hooks = new AutofillMap</* internalId */ string, Hook>();
  private gherkinDocuments = new GherkinDocuments();
  private fullResultTiming?: TimeMeasured;
  private onEndPromise: Promise<void>;
  private onEndPromiseResolve = () => {};
  private buildMessagesPromise?: Promise<void>;

  private eventDataCollectorEmitter = new EventEmitter();
  public eventDataCollector = new EventDataCollector(this.eventDataCollectorEmitter);

  constructor() {
    this.onEndPromise = new Promise((resolve) => (this.onEndPromiseResolve = resolve));
  }

  onBegin(config: pw.FullConfig) {
    this.fullConfig = config;
  }

  onTestEnd(test: pw.TestCase, result: pw.TestResult) {
    // Skip tests of non-bdd projects
    const testDir = test.parent.project()?.testDir || this.fullConfig.rootDir;
    if (!hasBddConfig(testDir)) return;

    // For skipped tests Playwright doesn't run fixtures
    // and we don't have bddData attachment -> don't know feature uri.
    // Don't add such test run to report.
    if (result.status === 'skipped') return;

    // Important to create TestCaseRun in this method (not later),
    // b/c test properties can change after retries
    // (especially annotations where we store bddData)
    const testCaseRun = new TestCaseRun(test, result, this.hooks);
    this.testCaseRuns.push(testCaseRun);
  }

  onEnd(fullResult: pw.FullResult) {
    this.fullResult = fullResult;
    this.onEndPromiseResolve();
  }

  /**
   * Builds Cucumber messages.
   * Note: wrapped into promise to build messages once for all reporters.
   */
  async buildMessages() {
    if (!this.buildMessagesPromise) this.buildMessagesPromise = this.doBuildMessages();
    return this.buildMessagesPromise;
  }

  private async doBuildMessages() {
    await this.onEndPromise;

    // order here is important
    await this.loadFeatures();
    this.createTestCases();

    this.addMeta();
    this.addSourcesAndDocuments();
    this.addPickles();
    this.addHooks();
    this.addTestRunStarted();
    this.addTestCases();
    this.addTestCaseRuns();
    this.addTestRunFinished();

    this.buildEventDataCollector();
  }

  emitMessages(eventBroadcaster: EventEmitter) {
    Object.values(this.report).forEach((value) => {
      if (!value) return;
      const messages = Array.isArray(value) ? value : [value];
      messages.forEach((message) => eventBroadcaster.emit('envelope', message));
    });
  }

  private createTestCases() {
    this.testCaseRuns.forEach((testCaseRun) => {
      const testId = testCaseRun.test.id;
      const gherkinDocsForProject = this.gherkinDocuments.getDocumentsForProject(
        testCaseRun.projectInfo,
      );
      const testCase = this.testCases.getOrCreate(
        testId,
        () => new TestCase(testId, gherkinDocsForProject),
      );
      testCase.addRun(testCaseRun);
      testCaseRun.testCase = testCase;
    });
  }

  private async loadFeatures() {
    await this.gherkinDocuments.load(this.testCaseRuns);
  }

  private addMeta() {
    this.report.meta = new Meta().buildMessage();
  }

  private addSourcesAndDocuments() {
    const { sources, gherkinDocuments } = this.gherkinDocuments.buildMessages();
    this.report.source = sources;
    this.report.gherkinDocument = gherkinDocuments;
  }

  private addPickles() {
    this.report.pickle = new Pickles().buildMessages(this.testCases);
  }

  private addHooks() {
    this.hooks.forEach((hook) => {
      const message = hook.buildMessage();
      this.report.hook.push(message);
    });
  }

  private addTestCases() {
    this.testCases.forEach((testCase) => {
      const message = testCase.buildMessage();
      this.report.testCase.push(message);
    });
  }

  private addTestCaseRuns() {
    this.testCaseRuns.map((testCaseRun) => {
      const messages = testCaseRun.buildMessages();
      this.report.testCaseRuns.push(...messages);
    });
  }

  private addTestRunStarted() {
    const { startTime } = this.getFullResultTiming();
    const testRunStarted: messages.TestRunStarted = {
      timestamp: toCucumberTimestamp(startTime.getTime()),
    };
    this.report.testRunStarted = { testRunStarted };
  }

  private addTestRunFinished() {
    const { startTime, duration } = this.getFullResultTiming();
    const testRunFinished: messages.TestRunFinished = {
      success: this.fullResult.status === 'passed',
      timestamp: toCucumberTimestamp(startTime.getTime() + duration),
    };
    this.report.testRunFinished = { testRunFinished };
  }

  private buildEventDataCollector() {
    this.emitMessages(this.eventDataCollectorEmitter);
  }

  private getFullResultTiming() {
    if (this.fullResultTiming) return this.fullResultTiming;
    // result.startTime and result.duration were added in pw 1.37
    // see: https://github.com/microsoft/playwright/pull/26760
    if ('startTime' in this.fullResult && 'duration' in this.fullResult) {
      this.fullResultTiming = {
        startTime: this.fullResult.startTime as Date,
        duration: this.fullResult.duration as number,
      };
    } else {
      // Calculate overall startTime and duration based on test timings
      const items = this.testCaseRuns.map((t) => t.result);
      this.fullResultTiming = calcMinMaxByArray(items);
    }

    return this.fullResultTiming;
  }
}
