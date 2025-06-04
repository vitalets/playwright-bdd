/**
 * Playwright reporter that generates different Cucumber reports.
 */
import {
  FullConfig,
  FullResult,
  Reporter as PlaywrightReporter,
  TestCase,
  TestError,
  TestResult,
} from '@playwright/test/reporter';
import { getMessagesBuilderRef, MessagesBuilderRef } from './messagesBuilder/ref';
import BaseReporter, { InternalOptions } from './base';
import MessageReporter from './message';
import HtmlReporter from './html';
import JunitReporter from './junit';
import JunitReporterModern from './junit-modern';
import JsonReporter from './json';
import CustomReporter, { CustomReporterOptions } from './custom';
import { getConfigDirFromEnv } from '../../config/env';

const builtinReporters = {
  html: HtmlReporter,
  message: MessageReporter,
  junit: JunitReporter,
  'junit-modern': JunitReporterModern, // New Junit reporter using @cucumber/junit-xml-formatter
  json: JsonReporter,
} as const;

export type BuiltinReporters = typeof builtinReporters;
export type CucumberReporterOptions<T> = T extends keyof BuiltinReporters
  ? ConstructorParameters<BuiltinReporters[T]>[1]
  : CustomReporterOptions;

export default class CucumberReporterAdapter<T extends keyof BuiltinReporters | string>
  implements PlaywrightReporter
{
  private messagesBuilderRef: MessagesBuilderRef;
  private type: T;
  private userOptions: CucumberReporterOptions<T>;
  private reporter: BaseReporter;

  constructor(fullOptions: { $type: T } & CucumberReporterOptions<T>) {
    const { $type, ...userOptions } = fullOptions;
    this.type = $type;
    this.userOptions = userOptions as unknown as CucumberReporterOptions<T>;
    this.messagesBuilderRef = getMessagesBuilderRef();
    this.reporter = this.createCucumberReporter();
  }

  private get messagesBuilder() {
    return this.messagesBuilderRef.builder;
  }

  onBegin(config: FullConfig) {
    this.messagesBuilderRef.onBegin(config);
  }

  printsToStdio() {
    return this.reporter.printsToStdio();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.messagesBuilderRef.onTestEnd(test, result);
  }

  /**
   * Error not related to any test, e.g. worker teardown.
   */
  onError(error: TestError) {
    this.messagesBuilderRef.onError(error);
  }

  async onEnd(result: FullResult) {
    this.messagesBuilderRef.onEnd(result);

    await this.reporter.init();

    await this.messagesBuilder.buildMessages();
    this.messagesBuilder.emitMessages(this.reporter.eventBroadcaster);

    await this.reporter.finished();
  }

  private createCucumberReporter() {
    const internalOptions: InternalOptions = {
      cwd: getConfigDirFromEnv(),
      messagesBuilder: this.messagesBuilder,
    };

    if (isBuiltInReporter(this.type)) {
      const BuiltInReporter = builtinReporters[this.type];
      return new BuiltInReporter(internalOptions, this.userOptions);
    } else {
      const reporterPath = this.type;
      return new CustomReporter(internalOptions, reporterPath, this.userOptions);
    }
  }
}

function isBuiltInReporter(type: keyof BuiltinReporters | string): type is keyof BuiltinReporters {
  return type in builtinReporters;
}
