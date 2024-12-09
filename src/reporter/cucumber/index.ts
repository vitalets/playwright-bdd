/**
 * Playwright reporter that generates different Cucumber reports.
 */
import EventEmitter from 'node:events';
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
import JsonReporter from './json';
import CustomReporter, { CustomReporterOptions } from './custom';
import { getConfigDirFromEnv } from '../../config/env';

const builtinReporters = {
  html: HtmlReporter,
  message: MessageReporter,
  junit: JunitReporter,
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

  onBegin(config: FullConfig) {
    this.messagesBuilderRef.onBegin(config);
  }

  printsToStdio() {
    return this.reporter.printsToStdio();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.messagesBuilderRef.onTestEnd(test, result);
  }

  onError(_error: TestError): void {
    // todo: implement
  }

  async onEnd(result: FullResult) {
    this.messagesBuilderRef.onEnd(result);

    await this.reporter.init();

    await this.messagesBuilderRef.builder.buildMessages();
    this.messagesBuilderRef.builder.emitMessages(this.reporter.eventBroadcaster);

    await this.reporter.finished();
  }

  private createCucumberReporter() {
    const internalOptions: InternalOptions = {
      cwd: getConfigDirFromEnv(),
      eventBroadcaster: new EventEmitter(),
      eventDataCollector: this.messagesBuilderRef.builder.eventDataCollector,
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
