/**
 * Shared stuff for worker and scenario hooks.
 * todo: move more functions here.
 */
import { TestTypeCommon } from '../playwright/types';
import { buildTagsExpression, extractTagsFromPath } from '../steps/tags';
import { relativeToCwd } from '../utils/paths';
import { GeneralScenarioHook } from './scenario';
import { GeneralStepHook } from './step';
import { WorkerHook } from './worker';

/**
 * Options passed when creating constructor for hooks.
 */
export type HookConstructorOptions = {
  worldFixture?: string;
  customTest?: TestTypeCommon;
  defaultTags?: string;
};

export function setTagsExpression(hook: WorkerHook | GeneralScenarioHook | GeneralStepHook) {
  const { defaultTags, options, location } = hook;
  // Possibly, we should use relative to configDir
  const relFilePath = relativeToCwd(location.file);
  const tagsFromPath = extractTagsFromPath(relFilePath);
  hook.tagsExpression = buildTagsExpression([...tagsFromPath, defaultTags, options.tags]);
}
