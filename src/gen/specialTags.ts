/**
 * Special tags.
 */

import { DescribeConfigureOptions } from '../playwright/types';

export class SpecialTags {
  only?: boolean;
  skip?: boolean;
  fixme?: boolean;
  fail?: boolean;

  retries?: number;
  timeout?: number;
  mode?: DescribeConfigureOptions['mode'];

  constructor(
    private ownTags: string[],
    private allTags: string[],
  ) {
    this.extractFlags();
    this.extractRetries();
    this.extractTimeout();
    this.extractMode();
  }

  private extractFlags() {
    // order is important
    const flags = ['only', 'fail', 'skip', 'fixme'] as const;
    for (const flag of flags) {
      if (this.ownTags.includes(`@${flag}`)) {
        this[flag] = true;
        return;
      }
    }

    // describe.fail is not supported, so mark all nested tests as failed instead
    if (this.allTags.includes(`@fail`)) {
      this.fail = true;
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
