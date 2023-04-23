/**
 * Get i18n keywords.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/cli/i18n.ts
 */
import { dialects, Dialect } from '@cucumber/gherkin';

// todo: cache targetMap

export type KeywordsMap = Map<string, string>;

export function getKeywordsMap(language: string) {
  const origMap = dialects[language];
  if (!origMap) throw new Error(`Language not found: ${language}`);
  const targetMap: KeywordsMap = new Map();
  const enKeywords = Object.keys(origMap) as (keyof Dialect)[];
  enKeywords.forEach((enKeyword) => handleKeyword(enKeyword, origMap, targetMap));
  return targetMap;
}

function handleKeyword(enKeyword: keyof Dialect, origMap: Dialect, targetMap: KeywordsMap) {
  const nativeKeywords = origMap[enKeyword];
  // Array.isArray converts to any[]
  if (typeof nativeKeywords === 'string') return;
  nativeKeywords.forEach((nativeKeyword) => {
    nativeKeyword = nativeKeyword.trim();
    if (!nativeKeyword || nativeKeyword === '*') return;
    targetMap.set(nativeKeyword, capitalizeFirstLetter(enKeyword));
  });
}

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
