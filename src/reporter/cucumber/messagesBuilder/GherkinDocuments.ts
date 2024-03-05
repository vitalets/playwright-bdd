/**
 * Loads Gherkin documents from feature files and maps them to projects.
 */
import * as messages from '@cucumber/messages';
import { AutofillMap } from '../../../utils/AutofillMap';
import { TestCaseRun } from './TestCaseRun';
import { FeaturesLoader, GherkinDocumentWithPickles } from '../../../cucumber/loadFeatures';
import { getPlaywrightConfigDir } from '../../../config/configDir';
import { ConcreteEnvelope } from './types';
import { GherkinDocumentClone } from './GherkinDocumentClone';
import { GherkinDocumentMessage } from './GherkinDocument';
import { PwProject } from './pwUtils';

export class GherkinDocuments {
  private featuresLoader = new FeaturesLoader();
  private projectsPerFeaturePath = new AutofillMap</* uri */ string, Set<PwProject>>();
  private gherkinDocumentsPerProject = new AutofillMap<PwProject, GherkinDocumentWithPickles[]>();

  constructor() {}

  async load(testCaseRuns: TestCaseRun[]) {
    this.fillProjectsPerFeaturePath(testCaseRuns);
    const cwd = getPlaywrightConfigDir();
    const featurePaths = [...this.projectsPerFeaturePath.keys()];
    await this.featuresLoader.load(featurePaths, { relativeTo: cwd });
    this.fillGherkinDocumentsPerProject();
  }

  getDocumentsForProject(project: PwProject) {
    const docs = this.gherkinDocumentsPerProject.get(project);
    if (!docs) throw new Error(`No gherkin docs for project ${project?.name}`);
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
      const projects = this.projectsPerFeaturePath.getOrCreate(
        testCaseRun.bddData.uri,
        () => new Set(),
      );
      projects.add(testCaseRun.project);
    });
  }

  private fillGherkinDocumentsPerProject() {
    this.featuresLoader.getDocumentsWithPickles().forEach((gherkinDocument) => {
      if (!gherkinDocument.uri) throw new Error(`Feature without uri`);
      const projects = this.projectsPerFeaturePath.get(gherkinDocument.uri);
      if (!projects) throw new Error(`Feature without projects`);
      projects.forEach((project) => {
        this.addGherkinDocumentToProject(project, gherkinDocument);
      });
    });
  }

  private addGherkinDocumentToProject(
    project: PwProject,
    gherkinDocument: GherkinDocumentWithPickles,
  ) {
    const projectDocs = this.gherkinDocumentsPerProject.getOrCreate(project, () => []);
    const clonedDocument = new GherkinDocumentClone(gherkinDocument).getClone();
    projectDocs.push(clonedDocument);
  }

  private buildSourceMessage(project: PwProject, doc: GherkinDocumentWithPickles) {
    if (!doc.uri) throw new Error(`Doc without uri`);
    const originalSource = this.featuresLoader.gherkinQuery.getSource(doc.uri);
    if (!originalSource) throw new Error(`No source`);
    const source: messages.Source = {
      ...originalSource,
      uri: getFeatureUriWithProject(project, doc.uri),
    };
    return { source };
  }
}

/**
 * Returns URI prepended with project name.
 * It allows to separate PW projects runs of the same feature file.
 *
 * Now result should not contain spaces as Cucumber HTML report uses it as uuid.
 * See: https://github.com/cucumber/react-components/issues/344
 */
export function getFeatureUriWithProject<T extends string | undefined>(project: PwProject, uri: T) {
  return project?.name && uri ? `[${project.name}]:${uri}` : uri;
}
