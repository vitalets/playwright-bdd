/**
 * Load features.
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/api/load_sources.ts
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/api/gherkin.ts
 */

import { GherkinStreams, IGherkinStreamOptions } from '@cucumber/gherkin-streams';
import { Query as GherkinQuery } from '@cucumber/gherkin-utils';
import { Envelope, ParseError, Pickle, GherkinDocument, Location } from '@cucumber/messages';
import { resolveFiles } from '../utils/paths';
import { toArray } from '../utils';

export type GherkinDocumentWithPickles = GherkinDocument & {
  pickles: PickleWithLocation[];
};

export type PickleWithLocation = Pickle & {
  location: Location;
};

export function resolveFeatureFiles(cwd: string, patterns: string | string[]) {
  return resolveFiles(cwd, toArray(patterns), 'feature');
}

export class FeaturesLoader {
  gherkinQuery = new GherkinQuery();
  parseErrors: ParseError[] = [];

  /**
   * Loads and parses feature files.
   * - featureFiles should be absolute.
   *   See: https://github.com/cucumber/gherkin-streams/blob/main/src/GherkinStreams.ts#L36
   * - if options.relativeTo is provided, uri in gherkin documents will be relative to it.
   *   See: https://github.com/cucumber/gherkin-streams/blob/main/src/SourceMessageStream.ts#L31
   * - options.defaultDialect is 'en' by default.
   *   See: https://github.com/cucumber/gherkin-streams/blob/main/src/makeGherkinOptions.ts#L5
   */
  async load(featureFiles: string[], options: IGherkinStreamOptions) {
    this.gherkinQuery = new GherkinQuery();
    this.parseErrors = [];
    // Without this early return gherkinFromPaths() produced weird behavior
    // for reporters: it does not keep exit code
    // See: https://github.com/vitalets/playwright-bdd/issues/200
    if (!featureFiles.length) return;
    await gherkinFromPaths(featureFiles, options, (envelope) => {
      this.gherkinQuery.update(envelope);
      if (envelope.parseError) {
        this.parseErrors.push(envelope.parseError);
      }
    });
  }

  getDocumentsCount() {
    return this.gherkinQuery.getGherkinDocuments().length;
  }

  getDocumentsWithPickles(): GherkinDocumentWithPickles[] {
    return this.gherkinQuery.getGherkinDocuments().map((gherkinDocument) => {
      const pickles = this.getDocumentPickles(gherkinDocument);
      return { ...gherkinDocument, pickles };
    });
  }

  private getDocumentPickles(gherkinDocument: GherkinDocument) {
    return this.gherkinQuery
      .getPickles()
      .filter((pickle) => gherkinDocument.uri === pickle.uri)
      .map((pickle) => this.getPickleWithLocation(pickle));
  }

  private getPickleWithLocation(pickle: Pickle) {
    const lastAstNodeId = pickle.astNodeIds[pickle.astNodeIds.length - 1];
    const location = this.gherkinQuery.getLocation(lastAstNodeId);
    return { ...pickle, location };
  }
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
