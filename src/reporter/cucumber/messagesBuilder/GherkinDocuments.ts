/**
 * Loads Gherkin documents from feature files.
 * The same feature can be executed in several PW projects,
 * for that we map feature files to projects as 1-to-many.
 */
import path from 'node:path';
import * as messages from '@cucumber/messages';
import { AutofillMap } from '../../../utils/AutofillMap';
import { TestCaseRun } from './TestCaseRun';
import { FeaturesLoader } from '../../../gherkin/featuresLoader';
import { GherkinDocumentWithPickles } from '../../../gherkin/types';
import { ConcreteEnvelope } from './types';
import { GherkinDocumentClone } from './GherkinDocumentClone';
import { GherkinDocumentMessage } from './GherkinDocument';
import { ProjectInfo, getFeatureUriWithProject } from './Projects';
import { getConfigDirFromEnv, getEnvConfigs } from '../../../config/env';
import { LANG_EN } from '../../../config/lang';

export class GherkinDocuments {
  private featuresLoader = new FeaturesLoader();
  private projectsPerFeaturePath = new AutofillMap</* uri */ string, Set<ProjectInfo>>();
  private gherkinDocumentsPerProject = new AutofillMap<ProjectInfo, GherkinDocumentWithPickles[]>();

  constructor() {}

  // todo: maybe testCaseRuns are not needed here,
  // we can pass testFiles + projects info
  async load(testCaseRuns: TestCaseRun[]) {
    this.fillProjectsPerFeaturePath(testCaseRuns);
    const cwd = getConfigDirFromEnv();
    const featurePaths = [...this.projectsPerFeaturePath.keys()].map((featurePath) =>
      path.resolve(cwd, featurePath),
    );
    await this.featuresLoader.load(featurePaths, {
      relativeTo: cwd,
      defaultDialect: this.getFeaturesLang(),
    });
    this.fillGherkinDocumentsPerProject();
  }

  getDocumentsForProject(projectInfo: ProjectInfo) {
    const docs = this.gherkinDocumentsPerProject.get(projectInfo);
    if (!docs) throw new Error(`No gherkin docs for project ${projectInfo?.projectName}`);
    return docs;
  }

  buildMessages() {
    const sources: ConcreteEnvelope<'source'>[] = [];
    const gherkinDocuments: ConcreteEnvelope<'gherkinDocument'>[] = [];
    this.gherkinDocumentsPerProject.forEach((docs, project) => {
      docs.forEach((doc) => {
        sources.push(this.buildSourceMessage(project, doc));
        gherkinDocuments.push(new GherkinDocumentMessage(project, doc).build());
      });
    });
    return { sources, gherkinDocuments };
  }

  private fillProjectsPerFeaturePath(testCaseRuns: TestCaseRun[]) {
    testCaseRuns.forEach((testCaseRun) => {
      this.projectsPerFeaturePath
        .getOrCreate(testCaseRun.featureUri, () => new Set())
        .add(testCaseRun.projectInfo);
    });
  }

  private fillGherkinDocumentsPerProject() {
    this.featuresLoader.getDocumentsWithPickles().forEach((gherkinDocument) => {
      if (!gherkinDocument.uri) throw new Error(`Feature without uri`);
      const projects = this.projectsPerFeaturePath.get(gherkinDocument.uri);
      if (!projects) throw new Error(`Feature without projects: ${gherkinDocument.uri}`);
      projects.forEach((project) => {
        this.addGherkinDocumentToProject(project, gherkinDocument);
      });
    });
  }

  private addGherkinDocumentToProject(
    projectInfo: ProjectInfo,
    gherkinDocument: GherkinDocumentWithPickles,
  ) {
    const clonedDocument = new GherkinDocumentClone(gherkinDocument).getClone();
    const projectDocs = this.gherkinDocumentsPerProject.getOrCreate(projectInfo, () => []);
    projectDocs.push(clonedDocument);
  }

  private buildSourceMessage(projectInfo: ProjectInfo, doc: GherkinDocumentWithPickles) {
    if (!doc.uri) throw new Error(`Doc without uri`);
    const originalSource = this.featuresLoader.gherkinQuery.getSource(doc.uri);
    if (!originalSource) throw new Error(`No source`);
    const source: messages.Source = {
      ...originalSource,
      uri: getFeatureUriWithProject(projectInfo, doc.uri),
    };
    return { source };
  }

  private getFeaturesLang() {
    const langsSet = new Set<string>();
    const envConfigs = getEnvConfigs();
    Object.values(envConfigs).forEach((config) => {
      langsSet.add(config.language || LANG_EN);
    });
    const langs = [...langsSet];
    if (langs.length > 1) {
      throw new Error(
        [
          `Multiple BDD configs with different language are not supported yet.`,
          `Detected languages: ${langs.join(', ')}`,
        ].join(' '),
      );
    }
    return langs[0];
  }
}
