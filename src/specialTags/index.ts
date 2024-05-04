/**
 * Special tags.
 */

import { DescribeConfigureOptions } from '../playwright/types';

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
    private ownTags: string[] = [],
    private tags: string[] = [],
  ) {
    this.extractFlags();
    this.extractRetries();
    this.extractTimeout();
    this.extractMode();
  }

  private extractFlags() {
    // for slow we use this.tags (not this.ownTags),
    // b/c each test.slow() call multiplies timeout
    // that is not now tags are assumed to work
    if (this.tags.includes(`@slow`)) this.slow = true;
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
        this.timeout = Number(match[1].replace(/_/g, ''));
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
