/**
 * FixWithAi is a separate global option that is enabled
 * when user sets fixWithAi=true in Cucumber HTML reporter.
 * - during generation phase it is used to overwrite 'page' fixture with aria snapshot capturing
 * - during test run it is used to ensure Cucumber HTML reporter is involved and perform aria snaphot capture
 *
 * Kept in a separate file to avoid unneeded dependencies in workers.
 */

export function setFixWithAiEnabled() {
  process.env.PLAYWRIGHT_BDD_FIX_WITH_AI = '1';
}

export function isFixWithAiEnabled() {
  return Boolean(process.env.PLAYWRIGHT_BDD_FIX_WITH_AI);
}
