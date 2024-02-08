/**
 * Adapter to generate Cucumber reports from Playwright.
 */
import EventEmitter from 'node:events';
import { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { getMessagesBuilderRef, MessagesBuilderRef } from './messagesBuilder';
import { BaseReporterOptions } from './base';
import { getPlaywrightConfigDir } from '../../config/configDir';
import MessageReporter from './message';
import HtmlReporter from './html';
import JunitReporter from './junit';
import JsonReporter from './json';
import { enableEnrichReporterData } from '../../config/enrichReporterData';

/**
 * Helper function to define reporter in a type-safe way.
 *
 * Examples:
 * reporter: [cucumberReporter('html')],
 * reporter: [cucumberReporter('html', { outputFile: 'cucumber-report.html' })],
 * // todo:
 * reporter: [cucumberReporter('./reporter.ts', { foo: 'bar' })],
 */
export function cucumberReporter<T extends keyof BuiltinReporters>(
  type: T,
  options?: CucumberReporterOptions<T>,
): [string, unknown] {
  return ['playwright-bdd/reporter/cucumber', { $type: type, ...options }] as const;
}

const builtinReporters = {
  html: HtmlReporter,
  message: MessageReporter,
  junit: JunitReporter,
  json: JsonReporter,
} as const;

type BuiltinReporters = typeof builtinReporters;
type CucumberReporterOptions<T> = T extends keyof BuiltinReporters
  ? ConstructorParameters<BuiltinReporters[T]>[1]
  : Record<string, unknown>;

/**
 * Adapter that receives Playwright reporter events
 * and passes them to Cucumber messages builder.
 * Then creates Cucumber reporter.
 */
export default class CucumberReporterAdapter<T extends keyof BuiltinReporters> implements Reporter {
  private messagesBuilderRef: MessagesBuilderRef;
  private reporter: InstanceType<BuiltinReporters[T]>;

  constructor(protected options: { $type: T } & CucumberReporterOptions<T>) {
    enableEnrichReporterData();
    this.messagesBuilderRef = getMessagesBuilderRef();
    this.reporter = this.createCucumberReporter();
  }

  printsToStdio() {
    return this.reporter.printsToStdio();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.messagesBuilderRef.onTestEnd(test, result);
  }

  async onEnd(result: FullResult) {
    this.messagesBuilderRef.onEnd(result);

    await this.messagesBuilderRef.builder.buildMessages();
    this.messagesBuilderRef.builder.emitMessages(this.reporter.eventBroadcaster);

    await this.reporter.finished();
  }

  private createCucumberReporter() {
    const baseOptions: BaseReporterOptions = {
      cwd: getPlaywrightConfigDir(),
      eventBroadcaster: new EventEmitter(),
      eventDataCollector: this.messagesBuilderRef.builder.eventDataCollector,
    };

    const ReporterConstructor = builtinReporters[this.options.$type];
    if (!ReporterConstructor) {
      // todo: support custom file as a reporter
      throw new Error(`Unsupported cucumber reporter: ${this.options.$type}`);
    }

    return new ReporterConstructor(baseOptions, this.options) as InstanceType<BuiltinReporters[T]>;
  }
}
