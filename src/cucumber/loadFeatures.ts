import { IRunConfiguration, IRunEnvironment } from '@cucumber/cucumber/api';
import { GherkinDocument, Pickle, ParseError } from '@cucumber/messages';
import { PickleWithDocument } from '@cucumber/cucumber/lib/api/gherkin';
import { loadSources } from './loadSources';
import { exitWithMessage } from '../utils';

export async function loadFeatures(
  runConfiguration: IRunConfiguration,
  environment?: IRunEnvironment,
) {
  const { filteredPickles, parseErrors } = await loadSources(runConfiguration.sources, environment);
  handleParseErrors(parseErrors);
  return groupByDocument(filteredPickles);
}

function groupByDocument(filteredPickles: PickleWithDocument[]) {
  const features = new Map<GherkinDocument, Pickle[]>();
  filteredPickles.forEach(({ pickle, gherkinDocument }) => {
    let pickles = features.get(gherkinDocument);
    if (!pickles) {
      pickles = [];
      features.set(gherkinDocument, pickles);
    }
    pickles.push(pickle);
  });
  return features;
}

function handleParseErrors(parseErrors: ParseError[]) {
  if (parseErrors.length) {
    const message = parseErrors
      .map((parseError) => {
        return `Parse error in "${parseError.source.uri}" ${parseError.message}`;
      })
      .join('\n');
    exitWithMessage(message);
  }
}
