/**
 * Caches step definitions by step text and block arguments.
 * do not cache matched results, because the same step text can match different definitions
 * depending on the presence of DocString or DataTable.
 *
 */
import { matchDefinitions, StepDefinition, StepMatchInput } from './stepDefinition';
import { MatchedStepDefinition } from './matchedStepDefinition';
import { stepDefinitions } from './stepRegistry';

const cache = new Map</* step text */ string, StepDefinition[]>();
let stepRegistryLength = stepDefinitions.length;

export function matchFromCache(step: StepMatchInput) {
  if (isRegistryChanged()) return;

  const cacheKey = getCacheKey(step);
  const cachedCandidates = cache.get(cacheKey);

  if (cachedCandidates) {
    // Match every time to capture the current step's DocString or DataTable.
    return matchDefinitions(cachedCandidates, step);
  }
}

export function updateCache(step: StepMatchInput, matchedDefinitions: MatchedStepDefinition[]) {
  if (isRegistryChanged()) invalidateCache();

  const cacheKey = getCacheKey(step);
  // we cache definitions, not the matched results,
  // because the same step text can match different definitions
  // depending on the presence of DocString or DataTable.
  const definitions = matchedDefinitions.map(({ definition }) => definition);

  cache.set(cacheKey, definitions);
}

function invalidateCache() {
  cache.clear();
  stepRegistryLength = stepDefinitions.length;
}

function isRegistryChanged() {
  return stepDefinitions.length !== stepRegistryLength;
}

function getCacheKey(step: StepMatchInput) {
  const hasDocString = step.docString !== undefined;
  const hasDataTable = step.dataTable !== undefined;
  return `${hasDocString}:${hasDataTable}:${step.text}`;
}
