/**
 * Custom Cucumber reporter.
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/custom_formatters.md
 */
import * as messages from '@cucumber/messages';
import { Formatter, IFormatterOptions } from '@cucumber/cucumber';

export default class SimpleFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options);
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      options.log(JSON.stringify(envelope) + '\n');
    });
  }
}
