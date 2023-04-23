/**
 * Copied from @cucumber/cucumber/lib/api/gherkin.d.ts
 * Fixes error:
 * Return type of exported function has or is using name 'PickleWithDocument'
 * from external module "../node_modules/@cucumber/cucumber/lib/api/gherkin"
 * but cannot be named
 */
import { Envelope, GherkinDocument, IdGenerator, Location, ParseError, Pickle } from '@cucumber/messages';
import { ISourcesCoordinates } from '@cucumber/cucumber/lib/api/types';
import { ILogger } from '@cucumber/cucumber/lib/logger';

declare module '@cucumber/cucumber/lib/api/gherkin' {
  export interface PickleWithDocument {
    gherkinDocument: GherkinDocument;
    location: Location;
    pickle: Pickle;
  }
  export function getFilteredPicklesAndErrors({
    newId,
    cwd,
    logger,
    unexpandedFeaturePaths,
    featurePaths,
    coordinates,
    onEnvelope,
  }: {
    newId: IdGenerator.NewId;
    cwd: string;
    logger: ILogger;
    unexpandedFeaturePaths: string[];
    featurePaths: string[];
    coordinates: ISourcesCoordinates;
    onEnvelope?: (envelope: Envelope) => void;
  }): Promise<{
    filteredPickles: PickleWithDocument[];
    parseErrors: ParseError[];
  }>;
}
