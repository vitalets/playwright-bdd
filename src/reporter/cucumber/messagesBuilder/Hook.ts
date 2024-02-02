/**
 * Manages hook.
 */
import { randomUUID } from 'node:crypto';
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';

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
    const bddSystemFixtures = ['fixture: $before', 'fixture: $after'];
    return bddSystemFixtures.includes(pwStep.title) ? undefined : pwStep.title;
  }

  private getSourceReference(pwStep: pw.TestStep): messages.SourceReference {
    const { file, line, column } = pwStep.location || {};
    return {
      uri: file, // todo: relative
      location: {
        line: line || 0,
        column,
      },
    };
  }
}
