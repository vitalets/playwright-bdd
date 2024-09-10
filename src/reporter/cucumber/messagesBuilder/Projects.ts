/**
 * Manages map of all projects.
 * For now use name as project id (undefined is for root project).
 * See: https://github.com/microsoft/playwright/issues/29841
 */
import * as pw from '@playwright/test/reporter';
import { AutofillMap } from '../../../utils/AutofillMap.js';

export type ProjectInfo = {
  projectName?: string;
  browserName?: string;
};

// title separator used in Playwright
export const TITLE_SEPARATOR = ' › ';

const projectsMap = new AutofillMap<string | undefined, ProjectInfo>();

export function getProjectInfo(test: pw.TestCase) {
  const project = test.parent.project();
  const projectId = project?.name;
  return projectsMap.getOrCreate(projectId, () => {
    return {
      projectName: project?.name,
      // browserName will be empty if not defined in project
      // todo: get browser info from bddData
      browserName: project?.use.browserName || project?.use.defaultBrowserType,
    };
  });
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
  return projectInfo?.projectName && uri ? `[${projectInfo.projectName}]:${uri}` : uri;
}

export function getFeatureNameWithProject(
  projectName: ProjectInfo['projectName'],
  featureName: string,
) {
  return projectName ? `${projectName}${TITLE_SEPARATOR}${featureName}` : featureName;
}
