/**
 * Representation of https://github.com/cucumber/cucumber-js/blob/main/src/api/gherkin.ts
 * Makes us less dependent on changes in Cucumber internal codebase.
 */

import { GherkinStreams, IGherkinStreamOptions } from '@cucumber/gherkin-streams';
import {
  Envelope,
  IdGenerator,
  ParseError,
  Pickle,
  GherkinDocument,
  Location,
} from '@cucumber/messages';
import { Query as GherkinQuery } from '@cucumber/gherkin-utils';
import type { ISourcesCoordinates } from '@cucumber/cucumber/lib/api/types';

export interface IFilterablePickle {
  pickle: Pickle;
  gherkinDocument: GherkinDocument;
  location: Location;
}

export async function getPicklesAndErrors({
  newId,
  cwd,
  sourcePaths,
  coordinates,
  onEnvelope,
}: {
  newId: IdGenerator.NewId;
  cwd: string;
  sourcePaths: string[];
  coordinates: ISourcesCoordinates;
  onEnvelope?: (envelope: Envelope) => void;
}): Promise<{
  filterablePickles: IFilterablePickle[];
  parseErrors: ParseError[];
  gherkinQuery: GherkinQuery;
}> {
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
      onEnvelope?.(envelope);
    },
  );

  const filterablePickles = gherkinQuery.getPickles().map((pickle) => {
    const gherkinDocument = gherkinQuery
      .getGherkinDocuments()
      .find((doc) => doc.uri === pickle.uri);
    if (!gherkinDocument) {
      throw new Error(`Gherkin document not found for pickle: ${pickle.uri}`);
    }
    const location = gherkinQuery.getLocation(pickle.astNodeIds[pickle.astNodeIds.length - 1]);
    return {
      gherkinDocument,
      location,
      pickle,
    };
  });

  return {
    filterablePickles,
    parseErrors,
    gherkinQuery,
  };
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
