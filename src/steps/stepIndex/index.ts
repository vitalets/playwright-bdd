/** Word-based index for fast step-definition matching. */
import { CucumberExpression } from '@cucumber/cucumber-expressions';
import { StepDefinition, StepMatchInput } from '../stepDefinition';
import { MatchedStepDefinition } from '../matchedStepDefinition';
import { requiredLiterals } from './requiredLiterals';

let indexedDefinitions: StepDefinition[] | null = null;
let indexedLength = -1;
let wordBuckets = new Map<string, StepDefinition[]>();
let scanList: StepDefinition[] = [];

export function matchWithStepIndex(
  definitions: StepDefinition[],
  step: StepMatchInput,
): MatchedStepDefinition[] {
  ensureIndex(definitions);
  return matchCandidates(step);
}

function matchCandidates(step: StepMatchInput): MatchedStepDefinition[] {
  const matched: MatchedStepDefinition[] = [];
  for (const definition of candidatesFor(step.text)) {
    const match = definition.matchStep(step);
    if (match) matched.push(match);
  }
  return matched;
}

function candidatesFor(stepText: string): StepDefinition[] {
  const candidates: StepDefinition[] = [...scanList];
  for (const [word, bucket] of wordBuckets) {
    if (stepText.includes(word)) candidates.push(...bucket);
  }
  return candidates;
}

function ensureIndex(definitions: StepDefinition[]) {
  if (definitions === indexedDefinitions && definitions.length === indexedLength) return;
  rebuildIndex(definitions);
}

function rebuildIndex(definitions: StepDefinition[]) {
  indexedDefinitions = definitions;
  indexedLength = definitions.length;
  wordBuckets = new Map();
  scanList = [];
  for (const definition of definitions) addToIndex(definition);
}

function addToIndex(definition: StepDefinition) {
  const word = indexWord(definition);
  if (!word) {
    scanList.push(definition);
    return;
  }
  const bucket = wordBuckets.get(word);
  if (bucket) bucket.push(definition);
  else wordBuckets.set(word, [definition]);
}

function indexWord(definition: StepDefinition): string | null {
  // BDD Expressions (`[click/tap on]`, `:name`) are a different grammar.
  if (definition.usesBddExpression()) return null;
  // RegExp stays on the scan list: source parsing has edge cases (e.g. /abcdefghij{foo|bar}/ matches "bar}").
  if (definition.pattern instanceof RegExp) return null;
  const expression = definition.expression as CucumberExpression;
  const literals = requiredLiterals(expression);
  return pickLongest(literals);
}

// Shorter words are shared by too many definitions to shrink the candidate set.
const MIN_INDEX_WORD_LENGTH = 8;
const LONG_WORD = new RegExp(`[A-Za-z][A-Za-z0-9]{${MIN_INDEX_WORD_LENGTH - 1},}`, 'g');

function pickLongest(literals: string[]): string | null {
  return longestWord(literals.flatMap(longWords));
}

function longWords(text: string): string[] {
  return text.match(LONG_WORD) ?? [];
}

function longestWord(words: string[]): string | null {
  let best = '';
  for (const word of words) {
    if (word.length > best.length) best = word;
  }
  return best || null;
}
