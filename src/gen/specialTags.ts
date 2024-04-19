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

  constructor(private ownTags: string[]) {
    this.extractFlags();
    this.extractRetries();
    this.extractTimeout();
    this.extractMode();
  }

  private extractFlags() {
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
      const match = tag.match(/@timeout:(\d+)/i);
      if (match) {
        this.timeout = Number(match[1]);
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
