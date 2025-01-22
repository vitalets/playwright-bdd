/**
 * During bddgen phase there is env variable PLAYWRIGHT_BDD_GEN set to '1'.
 * Keep this file separate as it is imported in workers -> no unneeded dependencies.
 * @public
 */
export function isBddGenPhase() {
  return Boolean(process.env.PLAYWRIGHT_BDD_GEN);
}

export function setBddGenPhase() {
  process.env.PLAYWRIGHT_BDD_GEN = '1';
}
