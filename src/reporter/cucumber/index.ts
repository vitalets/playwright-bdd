/**
 * Adapter to generate Cucumber reports from Playwright.
 */
import { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
// import { EventEmitter } from 'node:events';
// import fs from 'node:fs';
// import path from 'node:path';

// see: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/formatters.ts
// todo: import lazy?
// import MessageFormatter from '@cucumber/cucumber/lib/formatter/message_formatter';
// import HtmlFormatter from '@cucumber/cucumber/lib/formatter/html_formatter';
// import JunitFormatter from '@cucumber/cucumber/lib/formatter/junit_formatter';
// import JsonFormatter from '@cucumber/cucumber/lib/formatter/json_formatter';
// import { mergeEnvironment } from '@cucumber/cucumber/lib/api/environment';
// import { ILogger } from '@cucumber/cucumber/lib/logger';
// import { ConsoleLogger } from '@cucumber/cucumber/lib/api/console_logger';
// import { getPlaywrightConfigDir } from '../../config/dir';
// import { EventDataCollector } from '@cucumber/cucumber/lib/formatter/helpers';
// import getColorFns from '@cucumber/cucumber/lib/formatter/get_color_fns';
import { FormatOptions } from '@cucumber/cucumber/lib/formatter';
// import { promisify } from 'node:util';
// import StepDefinitionSnippetBuilder from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder';
// import {
//   ISnippetSnytax,
//   ISnippetSyntaxBuildOptions,
// } from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder/snippet_syntax';
// import { CucumberExpressionGenerator, ParameterTypeRegistry } from '@cucumber/cucumber-expressions';
// import { ISupportCodeLibrary } from '@cucumber/cucumber/api';
// import { SourcedParameterTypeRegistry }
// from '@cucumber/cucumber/lib/support_code_library_builder/sourced_parameter_type_registry';
import { CucumberMessagesBuilder } from './MessagesBuilder';

/**
 * Helper function to define reporter in a type-safe way.
 *
 * Examples:
 * reporter: [cucumberReporter('html')],
 * reporter: [cucumberReporter('html', { outputFile: 'cucumber-report.html' })],
 */
export function cucumberReporter(
  type: CucumberReporterOptions['type'],
  options: Omit<CucumberReporterOptions, 'type'> = {},
): [string, unknown] {
  return ['playwright-bdd/reporter/cucumber', { type, ...options }] as const;
}

export type CucumberReporterOptions = Pick<FormatOptions, 'colorsEnabled' | 'printAttachments'> & {
  type: 'messages' | 'html';
  outputFile?: string;
};

export default class CucumberReporter implements Reporter {
  protected messagesBuilder: CucumberMessagesBuilder;
  protected isFirstBuilderRef = false;

  constructor(protected options: CucumberReporterOptions) {
    this.messagesBuilder = CucumberMessagesBuilder.getInstance();
    this.isFirstBuilderRef = CucumberMessagesBuilder.referenceCount === 1;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (this.isFirstBuilderRef) {
      this.messagesBuilder.onTestEnd(test, result);
    }
  }

  async onEnd(result: FullResult) {
    if (this.isFirstBuilderRef) {
      this.messagesBuilder.onEnd(result);
    }

    await this.messagesBuilder.buildMessages();
  }

  private async createFormatter() {
    // load formatter constructor
    // const environment = { cwd: getPlaywrightConfigDir() };
    // const { cwd, stdout, stderr, env, debug } = mergeEnvironment(environment);
    // const logger: ILogger = new ConsoleLogger(stderr, debug);
    // const eventBroadcaster = new EventEmitter();
    // const eventDataCollector = new EventDataCollector(eventBroadcaster);
    // // additional options passed as formatOptions: or --format-options
    // // see: https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md#options
    // const parsedArgvOptions: FormatOptions = {
    //   colorsEnabled: this.options.colorsEnabled,
    //   printAttachments: this.options.printAttachments,
    // };
    // const stream = this.options.outputFile
    //   ? await this.createOutputFileStream(cwd, this.options.outputFile)
    //   : stdout;
    // const colorFns = getColorFns(stream, env, parsedArgvOptions.colorsEnabled);
    // const formatterOptions: IFormatterOptions = {
    //   colorFns,
    //   cwd,
    //   eventBroadcaster,
    //   eventDataCollector,
    //   log: stream.write.bind(stream),
    //   parsedArgvOptions,
    //   stream,
    //   cleanup:
    //     stream === stdout
    //       ? async () => await Promise.resolve()
    //       : promisify(stream.end.bind(stream)),
    //   // used in formatters: snippets
    //   snippetBuilder: fakeSnippetBuilder,
    //   // used in formatters: usage, json, snippets
    //   supportCodeLibrary: fakeSupportCodeLibrary,
    // };
    // const formatter = new MessageFormatter(formatterOptions);
    // emit envelopes
    // await f.finished()
  }

  // stream for writing to file
  // see: https://github.com/cucumber/cucumber-js/blob/main/src/api/formatters.ts#L87
  // private async createOutputFileStream(cwd: string, outputFile: string) {
  //   const absoluteTarget = path.resolve(cwd, outputFile);
  //   await fs.promises.mkdir(path.dirname(absoluteTarget), { recursive: true });
  //   return fs.createWriteStream(absoluteTarget);
  // }
}

// const fakeSnippetBuilder = new StepDefinitionSnippetBuilder({
//   snippetSyntax: {
//     build() {
//       return '';
//     },
//   },
//   parameterTypeRegistry: new ParameterTypeRegistry(),
// });

// maybe just keep stepDefinitions
// see: https://github.com/search?q=repo%3Acucumber%2Fcucumber-js+supportCodeLibrary.+path%3A%2F%5Esrc%5C%2Fformatter%5C%2F%2F&type=code
// see: test_case_attempt_parser https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/test_case_attempt_parser.ts#L129
// const fakeSupportCodeLibrary: ISupportCodeLibrary = {
//   originalCoordinates: {
//     requireModules: [],
//     requirePaths: [],
//     importPaths: [],
//   },
//   afterTestCaseHookDefinitions: [],
//   afterTestStepHookDefinitions: [],
//   afterTestRunHookDefinitions: [],
//   beforeTestCaseHookDefinitions: [],
//   beforeTestStepHookDefinitions: [],
//   beforeTestRunHookDefinitions: [],
//   defaultTimeout: 0,
//   stepDefinitions: [],
//   undefinedParameterTypes: [],
//   parameterTypeRegistry: new SourcedParameterTypeRegistry(),
//   World: () => {},
//   parallelCanAssign: () => false,
// };
