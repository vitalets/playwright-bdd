/**
 * Cache of step-definition matches keyed by step text.
 */
import { StepDefinition, StepMatchInput } from './stepDefinition';
import { MatchedStepDefinition } from './matchedStepDefinition';

type MatchMode = 'index' | 'scan';

let cachedDefinitions: StepDefinition[] | null = null;
let cachedLength = -1;
// Separate caches per mode, so comparing index and scan results for the same text is not short-circuited.
const matchCaches = new Map<MatchMode, Map<string, MatchedStepDefinition[]>>();

export function matchWithCache(options: {
  mode: MatchMode;
  definitions: StepDefinition[];
  step: StepMatchInput;
  matchUncached: (step: StepMatchInput) => MatchedStepDefinition[];
}): MatchedStepDefinition[] {
  const { mode, definitions, step, matchUncached } = options;
  if (!isCacheable(step)) return matchUncached(step);
  const cache = getCache(mode, definitions);
  const cached = cache.get(step.text);
  if (cached) return cached;
  const matched = matchUncached(step);
  cache.set(step.text, matched);
  return matched;
}

function isCacheable(step: StepMatchInput): boolean {
  // DocString and DataTable can change which BDD Expression matches, so the text alone is not a valid key.
  return step.docString === undefined && step.dataTable === undefined;
}

function getCache(mode: MatchMode, definitions: StepDefinition[]) {
  if (definitions !== cachedDefinitions || definitions.length !== cachedLength) {
    cachedDefinitions = definitions;
    cachedLength = definitions.length;
    matchCaches.clear();
  }
  let cache = matchCaches.get(mode);
  if (!cache) {
    cache = new Map();
    matchCaches.set(mode, cache);
  }
  return cache;
}
