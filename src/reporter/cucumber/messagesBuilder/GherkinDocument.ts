/**
 * Builds GherkinDocument message.
 * Attaches extra fields (meta).
 */
import * as messages from '@cucumber/messages';
import { GherkinDocumentWithPickles } from '../../../cucumber/loadFeatures';
import { ConcreteEnvelope } from './types';
import { omit } from '../../../utils';
import { getFeatureUriWithProject } from './GherkinDocuments';
import { PwProject } from './pwUtils';

type GherkinDocumentMeta = {
  originalUri: string;
  projectName?: string;
  browserName?: string;
};

type GherkinDocumentWithMeta = messages.GherkinDocument & {
  [gherkinDocumentMetaSymbol]: GherkinDocumentMeta;
};

const gherkinDocumentMetaSymbol = Symbol('gherkinDocumentMeta');

export class GherkinDocumentMessage {
  static extractMeta(gherkinDocument: messages.GherkinDocument) {
    return (gherkinDocument as GherkinDocumentWithMeta)[gherkinDocumentMetaSymbol];
  }

  constructor(
    private project: PwProject,
    private gherkinDocument: GherkinDocumentWithPickles,
  ) {}

  build(): ConcreteEnvelope<'gherkinDocument'> {
    const gherkinDocument = this.copyDocumentWithoutPickles();
    this.setUriWithProject(gherkinDocument);
    this.setMeta(gherkinDocument);
    return { gherkinDocument };
  }

  private copyDocumentWithoutPickles() {
    return omit(this.gherkinDocument, 'pickles');
  }

  private setUriWithProject(gherkinDocument: messages.GherkinDocument) {
    gherkinDocument.uri = getFeatureUriWithProject(this.project, this.gherkinDocument.uri);
  }

  private setMeta(gherkinDocument: messages.GherkinDocument) {
    (gherkinDocument as GherkinDocumentWithMeta)[gherkinDocumentMetaSymbol] = {
      originalUri: this.gherkinDocument.uri || '',
      projectName: this.project?.name,
      // browserName will be empty if not defined in project
      // todo: get browser info from bddData
      browserName: this.project?.use.browserName || this.project?.use.defaultBrowserType,
    };
  }
}
