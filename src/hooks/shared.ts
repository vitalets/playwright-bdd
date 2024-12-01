/**
 * Shared stuff for worker and scenario hooks.
 * todo: move more functions here.
 */
import { TestTypeCommon } from '../playwright/types';
import { buildTagsExpression, extractTagsFromPath } from '../steps/tags';
import { GeneralScenarioHook } from './scenario';
import { WorkerHook } from './worker';

/**
 * Options passed when creating constructor for hooks.
 */
export type HookConstructorOptions = {
  worldFixture?: string;
  customTest?: TestTypeCommon;
  defaultTags?: string;
};

export function setTagsExpression(hook: WorkerHook | GeneralScenarioHook) {
  const { defaultTags, options, location } = hook;
  const tagsFromPath = extractTagsFromPath(location.file);
  hook.tagsExpression = buildTagsExpression([...tagsFromPath, defaultTags, options.tags]);
}
