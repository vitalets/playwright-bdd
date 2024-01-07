import { IRunConfiguration, IRunEnvironment } from '@cucumber/cucumber/api';
import { GherkinDocument, Pickle, ParseError, IdGenerator } from '@cucumber/messages';
import { mergeEnvironment } from '@cucumber/cucumber/lib/api/environment';
import { ConsoleLogger } from '@cucumber/cucumber/lib/api/console_logger';
import { ILogger } from '@cucumber/cucumber/lib/logger';
import { exit } from '../utils/exit';
import { resovleFeaturePaths } from './resolveFeaturePaths';
import { IFilterablePickle, getPicklesAndErrors } from './gherkin';

export async function loadFeatures(
  runConfiguration: IRunConfiguration,
  environment: IRunEnvironment = {},
) {
  const { cwd, stderr, debug } = mergeEnvironment(environment);
  const logger: ILogger = new ConsoleLogger(stderr, debug);
  const newId = IdGenerator.uuid();
  const { featurePaths } = await resovleFeaturePaths(logger, cwd, runConfiguration.sources);
  const { filterablePickles, parseErrors } = await getPicklesAndErrors({
    newId,
    cwd,
    sourcePaths: featurePaths,
    coordinates: runConfiguration.sources,
  });

  handleParseErrors(parseErrors);
  return groupByDocument(filterablePickles);
}

function groupByDocument(filteredPickles: IFilterablePickle[]) {
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
    exit(message);
  }
}
