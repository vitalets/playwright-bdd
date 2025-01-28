/**
 * Special tags: @skip, @only, etc.
 * SpecialTags class uses only own tags of gherkin node (without any inheritance),
 * because inheritance is guaranteed by Playwright runner.
 */

import { DescribeConfigureOptions } from '../playwright/types';

export function isTestSkippedByCollectedTags(collectedTags: string[]) {
  return collectedTags.includes('@skip') || collectedTags.includes('@fixme');
}

export function isTestSlowByCollectedTags(collectedTags: string[]) {
  return collectedTags.includes('@slow');
}

export class SpecialTags {
  only?: boolean;
  skip?: boolean;
  fixme?: boolean;
  fail?: boolean;
  slow?: boolean;

  retries?: number;
  timeout?: number;
  mode?: DescribeConfigureOptions['mode'];

  constructor(
    private ownTags: string[] = [], // own tags of gherkin node
  ) {
    this.extractFlags();
    this.extractRetries();
    this.extractTimeout();
    this.extractMode();
  }

  // isSkipped() {
  //   return Boolean(this.skip || this.fixme);
  // }

  /**
   * Forces the test to be marked as `fixme` no matter which tags it has.
   * Used for marking tests with missing steps.
   */
  forceFixme() {
    this.fixme = true;
    this.only = false;
    this.retries = 0;
  }

  private extractFlags() {
    // Note: before for slow we used this.tags (not this.ownTags),
    // b/c slow converts to call of test.slow() and nested calls
    // of test.slow() multiplies timeout.
    // That is not now tags are assumed to work:
    // For example, if both feature and scenario have @slow tag,
    // it should work the same as if only scenario has @slow tag.
    // But now for simplification we use only own tags.
    if (this.ownTags.includes(`@slow`)) this.slow = true;
    if (this.ownTags.includes(`@fail`)) this.fail = true;
    // order is important
    const executionFlags = ['only', 'skip', 'fixme'] as const;
    for (const flag of executionFlags) {
      if (this.ownTags.includes(`@${flag}`)) {
        this[flag] = true;
        return;
      }
    }
  }

  private extractRetries() {
    for (const tag of this.ownTags.reverse()) {
      const match = tag.match(/@retries:(\d+)/i);
      if (match) {
        this.retries = Number(match[1]);
        return;
      }
    }
  }

  private extractTimeout() {
    for (const tag of this.ownTags.reverse()) {
      const match = tag.match(/@timeout:([\d_]+)/i);
      if (match) {
        this.timeout = Number(match[1]!.replace(/_/g, ''));
        return;
      }
    }
  }

  private extractMode() {
    for (const tag of this.ownTags.reverse()) {
      const match = tag.match(/@mode:(default|parallel|serial)/i);
      if (match) {
        this.mode = match[1] as DescribeConfigureOptions['mode'];
        return;
      }
    }
  }
}
