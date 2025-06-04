/**
 * New Junit reporter, uses separate package @cucumber/junit-xml-formatter.
 *
 * See: https://github.com/cucumber/junit-xml-formatter
 * See: https://github.com/cucumber/cucumber-js/pull/2445
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/plugin/plugin_manager.ts#L41
 */

import * as messages from '@cucumber/messages';
import BaseReporter, { InternalOptions } from './base';
import { GherkinDocumentMessage } from './messagesBuilder/GherkinDocument';

type JunitReporterOptions = {
  outputFile?: string;
  suiteName?: string;
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
    const { default: junitFormatterPlugin } = await import('@cucumber/junit-xml-formatter');
    junitFormatterPlugin.formatter({
      options: { suiteName: this.userOptions.suiteName },
      on: (_, handler) =>
        this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
          if (envelope.gherkinDocument) {
            // Add project and feature name to testcase name.
            // See: https://github.com/microsoft/playwright/issues/23432
            // Todo: https://github.com/cucumber/junit-xml-formatter/issues/74
            envelope = { gherkinDocument: addPrefixToNames(envelope.gherkinDocument) };
          }

          handler(envelope);
        }),
      write: (data) => this.outputStream.write(data),
    });
  }
}

function addPrefixToNames(gherkinDocument: messages.GherkinDocument) {
  const meta = GherkinDocumentMessage.extractMeta(gherkinDocument);
  const gherkinDocumentClone = JSON.parse(
    JSON.stringify(gherkinDocument),
  ) as messages.GherkinDocument;

  const buildPrefixedName = (name: string) =>
    [meta.projectName, gherkinDocumentClone?.feature?.name, name].filter(Boolean).join(' - ');

  gherkinDocumentClone.feature?.children.forEach((child) => {
    if (child.rule) child.rule.name = buildPrefixedName(child.rule.name);
    if (child.scenario) child.scenario.name = buildPrefixedName(child.scenario.name);
  });

  return gherkinDocumentClone;
}
