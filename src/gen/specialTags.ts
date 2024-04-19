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

  constructor(private ownTags: string[]) {
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

    // todo: allow @fail together with @only for describe (not test)
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
