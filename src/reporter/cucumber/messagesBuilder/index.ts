/**
 * Builds cucumber messages from Playwright test results.
 */
import * as pw from '@playwright/test/reporter';
import { TestCaseRun, TestCaseRunEnvelope } from './TestCaseRun';
import { TestCase } from './TestCase';
import { Meta } from './Meta';
import EventEmitter from 'node:events';
import EventDataCollector from '../../../cucumber/formatter/EventDataCollector.js';
import { Hook } from './Hook';
import { AutofillMap } from '../../../utils/AutofillMap.js';
import { GherkinDocuments } from './GherkinDocuments';
import { Pickles } from './Pickles';
import { ConcreteEnvelope } from './types';
import { getConfigFromEnv } from '../../../config/env';
import { TestFiles } from './TestFiles';
import { relativeToCwd } from '../../../utils/paths';
import { TestRun } from './TestRun';

export class MessagesBuilder {
  private report = {
    meta: null as ConcreteEnvelope<'meta'> | null,
    source: [] as ConcreteEnvelope<'source'>[],
    gherkinDocument: [] as ConcreteEnvelope<'gherkinDocument'>[],
    pickle: [] as ConcreteEnvelope<'pickle'>[],
    stepDefinition: [] as ConcreteEnvelope<'stepDefinition'>[],
    hook: [] as ConcreteEnvelope<'hook'>[],
    testRunStarted: null as ConcreteEnvelope<'testRunStarted'> | null,
    testCase: [] as ConcreteEnvelope<'testCase'>[],
    testCaseRuns: [] as TestCaseRunEnvelope[],
    testRunFinished: null as ConcreteEnvelope<'testRunFinished'> | null,
  };

  private fullConfig!: pw.FullConfig;
  private fullResult!: pw.FullResult;
  private testRun = new TestRun();
  public testCaseRuns: TestCaseRun[] = [];
  private testCases = new AutofillMap</* testId */ string, TestCase>();
  private hooks = new AutofillMap</* internalId */ string, Hook>();
  private gherkinDocuments = new GherkinDocuments();
  private testFiles = new TestFiles();
  private onEndPromise: Promise<void>;
  private onEndPromiseResolve = () => {};
  private buildMessagesPromise?: Promise<void>;

  // eventDataCollector is needed for Cucumber reports like junit and json
  private eventDataCollectorEmitter = new EventEmitter();
  public eventDataCollector = new EventDataCollector(this.eventDataCollectorEmitter);

  constructor() {
    this.onEndPromise = new Promise((resolve) => (this.onEndPromiseResolve = resolve));
  }

  onBegin(config: pw.FullConfig) {
    this.fullConfig = config;
  }

  onTestEnd(test: pw.TestCase, result: pw.TestResult) {
    const testDir = test.parent.project()?.testDir || this.fullConfig.rootDir;
    const bddConfig = getConfigFromEnv(testDir);

    // Skip tests of non-bdd projects
    if (!bddConfig) return;

    const { bddData, featureUri } = this.testFiles.getBddData(test.location.file);
    // todo: move these line somewhere else
    const bddTestData = bddData.find((data) => data.pwTestLine === test.location.line);
    if (!bddTestData) {
      const filePath = relativeToCwd(test.location.file);
      throw new Error(`Cannot find bddTestData for ${filePath}:${test.location.line}`);
    }

    // Important to create TestCaseRun in this method (not later),
    // b/c test properties can change after retries
    // especially annotations where we store bddData
    const testCaseRun = new TestCaseRun(bddTestData, featureUri, test, result, this.hooks);
    this.testCaseRuns.push(testCaseRun);
  }

  onEnd(fullResult: pw.FullResult) {
    this.fullResult = fullResult;
    this.onEndPromiseResolve();
  }

  onError(error: pw.TestError) {
    this.testRun.registerGlobalError(error);
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
    this.addTestRun();
    this.addTestCases();
    this.addTestCaseRuns();

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
        () => new TestCase(testId, gherkinDocsForProject, this.testRun.id),
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

  private addTestRun() {
    this.report.testRunStarted = this.testRun.buildTestRunStarted(this.fullResult);
    this.report.testRunFinished = this.testRun.buildTestRunFinished(this.fullResult);
  }

  private buildEventDataCollector() {
    this.emitMessages(this.eventDataCollectorEmitter);
  }
}
