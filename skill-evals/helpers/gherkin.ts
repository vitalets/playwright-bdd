import assert from 'node:assert/strict';
import { generateMessages } from '@cucumber/gherkin';
import { IdGenerator, SourceMediaType } from '@cucumber/messages';

export function parseFeature(source: string, uri = 'feature.feature') {
  const messages = generateMessages(source, uri, SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN, {
    newId: IdGenerator.incrementing(),
    includeGherkinDocument: true,
    includePickles: true,
  });
  const errors = messages.flatMap((message) => (message.parseError ? [message.parseError] : []));
  assert.deepEqual(errors, [], `Invalid Gherkin in ${uri}: ${JSON.stringify(errors)}`);
  const document = messages.find((message) => message.gherkinDocument)?.gherkinDocument;
  assert.ok(document?.feature, `No Feature found in ${uri}`);
  return {
    feature: document.feature,
    scenarios: messages.flatMap((message) => (message.pickle ? [message.pickle] : [])),
  };
}
