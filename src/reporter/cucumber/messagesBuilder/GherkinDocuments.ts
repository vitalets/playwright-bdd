/**
 * Loads Gherkin documents from feature files and maps them to projects.
 */
import * as messages from '@cucumber/messages';
import { MapWithCreate } from '../../../utils/MapWithCreate';
import { TestCaseRun } from './TestCaseRun';
import { FeaturesLoader, GherkinDocumentWithPickles } from '../../../cucumber/loadFeatures';
import { getPlaywrightConfigDir } from '../../../config/configDir';
import { ConcreteEnvelope } from './types';
import { GherkinDocumentClone } from './GherkinDocumentClone';
import { GherkinDocumentMessage } from './GherkinDocument';
import { ProjectInfo } from './pwUtils';

export class GherkinDocuments {
  private featuresLoader = new FeaturesLoader();
  private projects = new Map<ProjectInfo['id'], ProjectInfo>();
  private projectsPerFeaturePath = new MapWithCreate</* uri */ string, Set<ProjectInfo['id']>>();
  private gherkinDocumentsPerProject = new MapWithCreate<
    ProjectInfo['id'],
    GherkinDocumentWithPickles[]
  >();

  constructor() {}

  async load(testCaseRuns: TestCaseRun[]) {
    this.fillProjects(testCaseRuns);
    this.fillProjectsPerFeaturePath(testCaseRuns);
    const cwd = getPlaywrightConfigDir();
    const featurePaths = [...this.projectsPerFeaturePath.keys()];
    await this.featuresLoader.load(featurePaths, { relativeTo: cwd });
    this.fillGherkinDocumentsPerProject();
  }

  getDocumentsForProject(projectInfo: ProjectInfo) {
    const docs = this.gherkinDocumentsPerProject.get(projectInfo.id);
    if (!docs) throw new Error(`No gherkin docs for project ${projectInfo.name}`);
    return docs;
  }

  buildMessages() {
    const sources: ConcreteEnvelope<'source'>[] = [];
    const gherkinDocuments: ConcreteEnvelope<'gherkinDocument'>[] = [];
    this.gherkinDocumentsPerProject.forEach((docs, projectId) => {
      const projectInfo = this.projects.get(projectId)!;
      docs.forEach((doc) => {
        sources.push(this.buildSourceMessage(projectInfo, doc));
        gherkinDocuments.push(new GherkinDocumentMessage(projectInfo, doc).build());
      });
    });
    return { sources, gherkinDocuments };
  }

  private fillProjects(testCaseRuns: TestCaseRun[]) {
    testCaseRuns.forEach((testCaseRun) => {
      const { projectInfo } = testCaseRun;
      this.projects.set(projectInfo.id, projectInfo);
    });
  }

  private fillProjectsPerFeaturePath(testCaseRuns: TestCaseRun[]) {
    testCaseRuns.forEach((testCaseRun) => {
      const projectIds = this.projectsPerFeaturePath.getOrCreate(
        testCaseRun.bddData.uri,
        () => new Set(),
      );
      projectIds.add(testCaseRun.projectInfo.id);
    });
  }

  private fillGherkinDocumentsPerProject() {
    this.featuresLoader.getDocumentsWithPickles().forEach((gherkinDocument) => {
      if (!gherkinDocument.uri) throw new Error(`Feature without uri`);
      const projectIds = this.projectsPerFeaturePath.get(gherkinDocument.uri);
      if (!projectIds) throw new Error(`Feature without projects`);
      projectIds.forEach((projectId) => {
        this.addGherkinDocumentToProject(projectId, gherkinDocument);
      });
    });
  }

  private addGherkinDocumentToProject(
    projectId: string | undefined,
    gherkinDocument: GherkinDocumentWithPickles,
  ) {
    const projectDocs = this.gherkinDocumentsPerProject.getOrCreate(projectId, () => []);
    const clonedDocument = new GherkinDocumentClone(gherkinDocument).getClone();
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
}

/**
 * Returns URI prepended with project name.
 * It allows to separate PW projects runs of the same feature file.
 *
 * Now result should not contain spaces as Cucumber HTML report uses it as uuid.
 * See: https://github.com/cucumber/react-components/issues/344
 */
export function getFeatureUriWithProject<T extends string | undefined>(
  projectInfo: ProjectInfo,
  uri: T,
) {
  return projectInfo.name && uri ? `[${projectInfo.name}]:${uri}` : uri;
}
