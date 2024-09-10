/**
 * Hook that can be used in different test cases.
 * Builds Cucumber's hook message.
 */
import { randomUUID } from 'node:crypto';
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { getPlaywrightConfigDir } from '../../../config/configDir.js';
import path from 'node:path';

export type HookType = 'before' | 'after';

export class Hook {
  static getInternalId(pwStep: pw.TestStep) {
    const { file, line, column } = pwStep.location || {};
    return [pwStep.category, ...pwStep.titlePath(), file, line, column].join('|');
  }

  id: string;
  name?: string;
  sourceReference: messages.SourceReference;

  constructor(
    public internalId: string,
    /* one of pwSteps for this hook */
    pwStep: pw.TestStep,
  ) {
    this.id = randomUUID();
    this.name = this.getName(pwStep);
    this.sourceReference = this.getSourceReference(pwStep);
  }

  buildMessage() {
    const hook: messages.Hook = {
      id: this.id,
      name: this.name,
      sourceReference: this.sourceReference,
    };
    return { hook };
  }

  private getName(pwStep: pw.TestStep) {
    // These fixture names are for anonymous hooks
    // created with Before() / After() functions.
    // Keep name empty for them to be consistent with Cucumber.
    // const bddSystemFixtures = ['fixture: $before', 'fixture: $after'];
    // if (!pwStep.title || bddSystemFixtures.includes(pwStep.title)) return undefined;
    return pwStep.title;
  }

  private getSourceReference(pwStep: pw.TestStep): messages.SourceReference {
    const { file, line, column } = pwStep.location || {};
    const uri = file ? path.relative(getPlaywrightConfigDir(), file) : undefined;
    return {
      uri,
      location: line
        ? {
            line,
            column,
          }
        : undefined,
    };
  }
}
