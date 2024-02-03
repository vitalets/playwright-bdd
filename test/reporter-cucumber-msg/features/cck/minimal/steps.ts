/**
 * Based on: node_modules/@cucumber/compatibility-kit/features/minimal/minimal.feature.ts
 */
import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

Given('I have {int} cukes in my belly', function ({}, _cukeCount: number) {
  // no-op
});
