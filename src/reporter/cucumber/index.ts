/**
 * Playwright reporter that generates different Cucumber reports.
 *
 * If there are multiple Cucumber reporters, they all generate the same Playwright messages,
 * targeting messagesBuilder. The messagesBuilder performs heavy operations (like reading feature files),
 * so we should build Cucumber messages only once. To achieve that, we keep track
 * of the reporters count in teh reporters-registry and send Playwright events only from the first reporter.
 * In onEnd, all reporters wait for messages to get built and emit them to the Cucumber reporter implementation.
 */
import {
  FullConfig,
  FullResult,
  Reporter as PlaywrightReporter,
  TestCase,
  TestError,
  TestResult,
} from '@playwright/test/reporter';
import BaseReporter, { InternalOptions } from './base';
import MessageReporter from './message';
import HtmlReporter from './html';
import JunitReporter from './junit';
import JunitReporterModern from './junit-modern';
import JsonReporter from './json';
import CustomReporter, { CustomReporterOptions } from './custom';
import { getConfigDirFromEnv } from '../../config/env';
import { getMessagesBuilder, registerReporter, unregisterReporter } from './reporters-registry';

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

export default class CucumberReporterAdapter<
  T extends keyof BuiltinReporters | string,
> implements PlaywrightReporter {
  private type: T;
  private userOptions: CucumberReporterOptions<T>;
  private reporter: BaseReporter;
  private isFirstReporter: boolean;

  constructor(fullOptions: { $type: T } & CucumberReporterOptions<T>) {
    const { $type, ...userOptions } = fullOptions;
    this.type = $type;
    this.userOptions = userOptions as unknown as CucumberReporterOptions<T>;
    this.reporter = this.createCucumberReporter();
    this.isFirstReporter = registerReporter();
  }

  onBegin(config: FullConfig) {
    if (this.isFirstReporter) getMessagesBuilder().onBegin(config);
  }

  printsToStdio() {
    return this.reporter.printsToStdio();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (this.isFirstReporter) getMessagesBuilder().onTestEnd(test, result);
  }

  /**
   * Error not related to any test, e.g. worker teardown.
   */
  onError(error: TestError) {
    if (this.isFirstReporter) getMessagesBuilder().onError(error);
  }

  async onEnd(result: FullResult) {
    try {
      if (this.isFirstReporter) await getMessagesBuilder().onEnd(result);

      await this.reporter.init();

      await getMessagesBuilder().finished;
      getMessagesBuilder().emitMessages(this.reporter.eventBroadcaster);

      await this.reporter.finished();
    } finally {
      unregisterReporter();
    }
  }

  private createCucumberReporter() {
    const internalOptions: InternalOptions = {
      cwd: getConfigDirFromEnv(),
      messagesBuilder: getMessagesBuilder(),
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
