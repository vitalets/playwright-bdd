/**
 * Cucumber JUnit reporter.
 *
 * Uses https://github.com/cucumber/junit-xml-formatter.
 */

import * as messages from '@cucumber/messages';
import { NamingStrategy, Lineage } from '@cucumber/query';
import junitFormatterPlugin from '@cucumber/junit-xml-formatter';
import BaseReporter, { InternalOptions } from './base';
import { GherkinDocumentMessage } from './messagesBuilder/GherkinDocument';

// title separator used in Playwright
const PLAYWRIGHT_TITLE_SEPARATOR = ' › ';

type JunitReporterOptions = {
  outputFile?: string;
  suiteName?: string;
  nameFormat?: 'cucumber' | 'playwright';
};

export default class JunitReporter extends BaseReporter {
  constructor(
    internalOptions: InternalOptions,
    protected userOptions: JunitReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);
  }

  async init() {
    junitFormatterPlugin.formatter({
      options: {
        suiteName: this.userOptions.suiteName,
        testNamingStrategy: this.getNamingStrategy(),
      },
      on: (_type, handler) => this.eventBroadcaster.on('envelope', handler),
      write: (data) => this.outputStream.write(data),
    });
  }

  private getNamingStrategy() {
    return this.userOptions.nameFormat === 'playwright'
      ? new PlaywrightNamingStrategy()
      : undefined;
  }
}

class PlaywrightNamingStrategy implements NamingStrategy {
  reduce(lineage: Lineage, pickle: messages.Pickle): string {
    const meta = lineage.gherkinDocument
      ? GherkinDocumentMessage.extractMeta(lineage.gherkinDocument)
      : undefined;
    const scenarioName = lineage.scenario?.name ?? pickle.name;
    const pickleName = pickle.name;

    return [
      meta?.projectName, // prettier-ignore
      lineage.feature?.name,
      lineage.rule?.name,
      !hasPlaceholders(scenarioName) ? scenarioName : undefined,
      pickleName !== scenarioName ? pickleName : undefined,
    ]
      .filter(Boolean)
      .join(PLAYWRIGHT_TITLE_SEPARATOR);
  }
}

function hasPlaceholders(value: string) {
  return /<[^>]+>/.test(value);
}
