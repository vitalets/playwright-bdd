/**
 * Load features.
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/api/load_sources.ts
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/api/gherkin.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { generateMessages } from '@cucumber/gherkin';
import { Query as GherkinQuery } from '@cucumber/gherkin-utils';
import {
  ParseError,
  Pickle,
  IdGenerator,
  SourceMediaType,
} from '@cucumber/messages';
import { resolveFiles } from '../utils/paths';
import { toArray } from '../utils';
import { GherkinDocumentWithPickles, PickleWithLocation } from './types';

export function resolveFeatureFiles(cwd: string, patterns: string | string[]) {
  return resolveFiles(cwd, toArray(patterns), 'feature');
}

type LoadFeaturesOptions = {
  // Default is 'en'.
  // See: https://github.com/cucumber/gherkin-streams/blob/main/src/makeGherkinOptions.ts#L5
  defaultDialect?: string;
  // If relativeTo is provided, uri in gherkin documents will be relative to it.
  // See: https://github.com/cucumber/gherkin-streams/blob/main/src/SourceMessageStream.ts#L31
  relativeTo?: string;
};

const newId = IdGenerator.uuid();

export class FeaturesLoader {
  gherkinQuery = new GherkinQuery();
  parseErrors: ParseError[] = [];

  async load(absFeatureFiles: string[], options: LoadFeaturesOptions) {
    this.gherkinQuery = new GherkinQuery();
    this.parseErrors = [];

    // Load features sequentially (as it was in gherkin-streams).
    // Potentially it can be parallelized in the future.
    // See: https://github.com/cucumber/gherkin-streams/blob/main/src/GherkinStreams.ts#L30
    for (const featureFile of absFeatureFiles) {
      await this.loadFeature(featureFile, options);
    }
  }

  getDocumentsCount() {
    return this.gherkinQuery.getGherkinDocuments().length;
  }

  getDocumentsWithPickles(): GherkinDocumentWithPickles[] {
    const picklesByUri = new Map<string, Pickle[]>();
    for (const pickle of this.gherkinQuery.getPickles()) {
      const uri = pickle.uri!;
      let arr = picklesByUri.get(uri);
      if (!arr) {
        arr = [];
        picklesByUri.set(uri, arr);
      }
      arr.push(pickle);
    }

    return this.gherkinQuery.getGherkinDocuments().map((gherkinDocument) => {
      const pickles = (picklesByUri.get(gherkinDocument.uri!) ?? []).map((pickle) =>
        this.getPickleWithLocation(pickle),
      );
      return { ...gherkinDocument, pickles };
    });
  }

  private async loadFeature(featureFile: string, options: LoadFeaturesOptions) {
    const uri = getFeatureUri(featureFile, options);
    const gherkinSource = await fs.promises.readFile(featureFile, 'utf8');
    const gherkinOptions = makeGherkinOptions(options);

    const envelopes = generateMessages(
      gherkinSource,
      uri,
      SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN,
      gherkinOptions,
    );

    envelopes.forEach((envelope) => {
      this.gherkinQuery.update(envelope);
      if (envelope.parseError) {
        this.parseErrors.push(envelope.parseError);
      }
    });
  }

  private getPickleWithLocation(pickle: Pickle): PickleWithLocation {
    const lastAstNodeId = pickle.astNodeIds[pickle.astNodeIds.length - 1]!;
    // Pickle.location is optional in @cucumber/messages, but @cucumber/gherkin
    // always populates it (added in gherkin v37). Safe to assert non-null.
    const location = this.gherkinQuery.getLocation(lastAstNodeId)!;
    return { ...pickle, location };
  }
}

function makeGherkinOptions(options: LoadFeaturesOptions) {
  return {
    defaultDialect: options.defaultDialect,
    includeSource: true,
    includeGherkinDocument: true,
    includePickles: true,
    newId,
  };
}

function getFeatureUri(featureFile: string, options: LoadFeaturesOptions) {
  return options.relativeTo ? path.relative(options.relativeTo, featureFile) : featureFile;
}
