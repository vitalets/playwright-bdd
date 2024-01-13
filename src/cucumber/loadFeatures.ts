/**
 * Load features.
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/api/load_sources.ts
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/api/gherkin.ts
 */
import { IRunConfiguration, IRunEnvironment } from '@cucumber/cucumber/api';
import { mergeEnvironment } from '@cucumber/cucumber/lib/api/environment';
import { ISourcesCoordinates } from '@cucumber/cucumber/lib/api/types';
import { ConsoleLogger } from '@cucumber/cucumber/lib/api/console_logger';
import { GherkinStreams, IGherkinStreamOptions } from '@cucumber/gherkin-streams';
import { ILogger } from '@cucumber/cucumber/lib/logger';
import { Query as GherkinQuery } from '@cucumber/gherkin-utils';
import {
  Envelope,
  IdGenerator,
  ParseError,
  Pickle,
  GherkinDocument,
  Location,
} from '@cucumber/messages';
import { exit } from '../utils/exit';
import { resovleFeaturePaths } from './resolveFeaturePaths';

export type DocumentWithPickles = {
  gherkinDocument: GherkinDocument;
  pickles: PickleWithLocation[];
};

export type PickleWithLocation = Pickle & {
  location: Location;
};

export async function loadFeatures(
  runConfiguration: IRunConfiguration,
  environment: IRunEnvironment = {},
) {
  const { cwd, stderr, debug } = mergeEnvironment(environment);
  const logger: ILogger = new ConsoleLogger(stderr, debug);
  const { featurePaths } = await resovleFeaturePaths(logger, cwd, runConfiguration.sources);
  const { gherkinQuery, parseErrors } = await loadFiles({
    newId: IdGenerator.uuid(),
    cwd,
    sourcePaths: featurePaths,
    coordinates: runConfiguration.sources,
  });
  handleParseErrors(parseErrors);

  return buildDocumentsWithPickles(gherkinQuery);
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

function buildDocumentsWithPickles(gherkinQuery: GherkinQuery): DocumentWithPickles[] {
  return gherkinQuery.getGherkinDocuments().map((gherkinDocument) => {
    const pickles = gherkinQuery
      .getPickles()
      .filter((pickle) => gherkinDocument.uri === pickle.uri)
      .map((pickle) => {
        return { ...pickle, location: getPickleLocation(gherkinQuery, pickle) };
      });

    return { gherkinDocument, pickles };
  });
}

async function loadFiles({
  newId,
  cwd,
  sourcePaths,
  coordinates,
}: {
  newId: IdGenerator.NewId;
  cwd: string;
  sourcePaths: string[];
  coordinates: ISourcesCoordinates;
}) {
  const gherkinQuery = new GherkinQuery();
  const parseErrors: ParseError[] = [];
  await gherkinFromPaths(
    sourcePaths,
    {
      newId,
      relativeTo: cwd,
      defaultDialect: coordinates.defaultDialect,
    },
    (envelope) => {
      gherkinQuery.update(envelope);
      if (envelope.parseError) {
        parseErrors.push(envelope.parseError);
      }
    },
  );

  return { gherkinQuery, parseErrors };
}

function getPickleLocation(gherkinQuery: GherkinQuery, pickle: Pickle) {
  // use last astNode as a pickle location
  return gherkinQuery.getLocation(pickle.astNodeIds[pickle.astNodeIds.length - 1]);
}

async function gherkinFromPaths(
  paths: string[],
  options: IGherkinStreamOptions,
  onEnvelope: (envelope: Envelope) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const gherkinMessageStream = GherkinStreams.fromPaths(paths, options);
    gherkinMessageStream.on('data', onEnvelope);
    gherkinMessageStream.on('end', resolve);
    gherkinMessageStream.on('error', reject);
  });
}
