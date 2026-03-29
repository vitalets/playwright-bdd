/**
 * Custom Cucumber reporter.
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/custom_formatters.md
 */
import * as messages from '@cucumber/messages';
import BaseReporter, { InternalOptions } from './base';
import Formatter, { IFormatterOptions } from '../../cucumber/formatter';
import getColorFns from '../../cucumber/formatter/getColorFns';
import { requireOrImport, requireOrImportDefaultFunction } from '../../playwright/requireOrImport';

export type CustomReporterOptions = {
  colorsEnabled?: boolean;
  outputFile?: string;
  [k: string]: unknown;
};

/**
 * Interface for message-based printers (e.g. @cucumber/pretty-formatter v3+).
 * These export named classes with an `update(envelope)` method instead of
 * extending the legacy cucumber-js Formatter class.
 */
type MessagePrinterConstructor = new (params: {
  stream?: NodeJS.WritableStream;
  options?: Record<string, unknown>;
}) => { update(envelope: messages.Envelope): void };

export default class CustomReporter extends BaseReporter {
  private formatter?: Formatter;

  constructor(
    internalOptions: InternalOptions,
    protected reporterPathOrModule: string,
    protected userOptions: CustomReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);
  }

  printsToStdio() {
    // currently always return true, b/c loading of custom reporter is async,
    // but printsToStdio() is called synchronously at the beginning.
    return true;
  }

  async init() {
    const reporterPath = require.resolve(this.reporterPathOrModule, {
      paths: [this.internalOptions.cwd],
    });
    const module = await requireOrImport(reporterPath);
    this.initFromModule(module, reporterPath);
  }

  private initFromModule(module: unknown, reporterPath: string) {
    // Try traditional formatter approach first (default export class with IFormatterOptions).
    const defaultExport = extractDefaultExport(module);
    if (typeof defaultExport === 'function') {
      const formatterOptions = this.buildFormatterOptions();
      this.formatter = new (defaultExport as new (o: IFormatterOptions) => Formatter)(
        formatterOptions,
      );
      return;
    }

    // Fall back to message-printer approach: a named-export class with update(envelope).
    // Used e.g. by @cucumber/pretty-formatter v3+.
    const PrinterClass = findPrinterConstructor(module);
    if (PrinterClass) {
      const printer = new PrinterClass({ stream: this.outputStream, options: this.userOptions });
      this.eventBroadcaster.on('envelope', (envelope) => printer.update(envelope));
      return;
    }

    const msg = 'file must export a formatter class (default export) or a message printer class.';
    throw new Error(`${reporterPath}: ${msg}`);
  }

  async finished() {
    await this.formatter?.finished();
    await super.finished();
  }

  protected async loadFormatterFromFile() {
    // see: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/config.ts#L225
    const reporterPath = require.resolve(this.reporterPathOrModule, {
      paths: [this.internalOptions.cwd],
    });
    return requireOrImportDefaultFunction(reporterPath, true);
  }

  protected buildFormatterOptions(): IFormatterOptions {
    const colorFns = getColorFns(this.outputStream, process.env, this.userOptions.colorsEnabled);
    return {
      cwd: this.internalOptions.cwd,
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: this.eventDataCollector,
      parsedArgvOptions: this.userOptions,
      colorFns,
      stream: this.outputStream,
      log: this.outputStream.write.bind(this.outputStream),
      cleanup: async () => {},
      snippetBuilder: null,
      // Build truncated supportCodeLibrary object. It can lead to errors in custom reporters.
      // For full object see:
      // https://github.com/cucumber/cucumber-js/blob/main/src/support_code_library_builder/types.ts#L160
      supportCodeLibrary: {
        World: {},
      },
    };
  }
}

/**
 * Extracts the default export from a module (handles both ESM and CJS shapes).
 */
function extractDefaultExport(module: unknown): unknown {
  if (module && typeof module === 'object' && 'default' in (module as object)) {
    return (module as Record<string, unknown>)['default'];
  }
  return typeof module === 'function' ? module : undefined;
}

/**
 * Finds a message-printer constructor in a module: a class whose prototype has
 * an `update(envelope)` method (e.g. PrettyPrinter from @cucumber/pretty-formatter v3+).
 */
function findPrinterConstructor(module: unknown): MessagePrinterConstructor | undefined {
  if (!module || typeof module !== 'object') return undefined;
  const values = Object.values(module as Record<string, unknown>);
  const found = values.find(isPrinterConstructor);
  return found as MessagePrinterConstructor | undefined;
}

function isPrinterConstructor(value: unknown): boolean {
  return (
    typeof value === 'function' &&
    Boolean(value.prototype) &&
    typeof (value as { prototype: Record<string, unknown> }).prototype['update'] === 'function'
  );
}
