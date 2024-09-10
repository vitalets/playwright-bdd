/**
 * Builds GherkinDocument message.
 * Attaches extra fields (meta).
 */
import * as messages from '@cucumber/messages';
import { GherkinDocumentWithPickles } from '../../../features/load.js';
import { ConcreteEnvelope } from './types';
import { omit } from '../../../utils/index.js';
import { ProjectInfo, getFeatureUriWithProject } from './Projects';

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
    private projectInfo: ProjectInfo,
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
    gherkinDocument.uri = getFeatureUriWithProject(this.projectInfo, this.gherkinDocument.uri);
  }

  private setMeta(gherkinDocument: messages.GherkinDocument) {
    (gherkinDocument as GherkinDocumentWithMeta)[gherkinDocumentMetaSymbol] = {
      originalUri: this.gherkinDocument.uri || '',
      projectName: this.projectInfo?.projectName,
      browserName: this.projectInfo?.browserName,
    };
  }
}
