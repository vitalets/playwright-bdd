/**
 * Helpers for Cucumber language option.
 */

export const LANG_EN = 'en';

export function isEnglish(lang?: string) {
  return !lang || lang === LANG_EN;
}
