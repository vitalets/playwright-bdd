/**
 * Hook that can be used in different test cases.
 * Builds Cucumber's hook message.
 * See: https://github.com/cucumber/messages/blob/main/messages.md#hook
 *
 * Hook is created from TestCaseRunHooks class.
 */
import { randomUUID } from 'node:crypto';
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import path from 'node:path';
import { getConfigDirFromEnv } from '../../../config/env';
import { BEFORE_EACH_HOOKS_GROUP_NAME } from '../../../hooks/const';
import { findParentWith } from './pwStepUtils';

// We don't distinguish between BeforeAll / Before hooks here (and AfterAll / After)
// Do it only when building cucumber message: setting messages.HookType.
export type HooksGroup = 'before' | 'after';

export class Hook {
  // persistent hook ID to avoid hook duplicates due to several run of hook.
  static getInternalId(pwStep: pw.TestStep) {
    const { file, line, column } = pwStep.location || {};
    return [pwStep.category, ...pwStep.titlePath(), file, line, column].join('|');
  }

  public id: string;
  public hookType: messages.HookType;

  constructor(
    public internalId: string,
    group: HooksGroup,
    /* one of pwSteps for this hook */
    private pwStep: pw.TestStep,
  ) {
    this.id = randomUUID();
    this.hookType = group === 'before' ? this.getBeforeHookType() : this.getAfterHookType();
  }

  buildMessage() {
    const hook: messages.Hook = {
      type: this.hookType,
      name: this.getName(),
      id: this.id,
      sourceReference: this.getSourceReference(),
    };
    return { hook };
  }

  private getName() {
    // These fixture names are for anonymous hooks
    // created with Before() / After() functions.
    // Keep name empty for them to be consistent with Cucumber.
    // const bddSystemFixtures = ['fixture: $before', 'fixture: $after'];
    // if (!pwStep.title || bddSystemFixtures.includes(pwStep.title)) return undefined;
    return this.pwStep.title;
  }

  private getBeforeHookType(): messages.HookType {
    // beforeEach hooks are located inside the hooks group created by test.beforeEach()
    const beforeHooksGroupStep = findParentWith(this.pwStep, (step) => {
      return step.category === 'hook' && step.title === BEFORE_EACH_HOOKS_GROUP_NAME;
    });

    return beforeHooksGroupStep
      ? messages.HookType.BEFORE_TEST_CASE
      : messages.HookType.BEFORE_TEST_RUN;
  }

  private getAfterHookType(): messages.HookType {
    // afterEach hooks are NOT located inside the hooks group created by test.afterEach()
    // possibly bug in the Playwright.
    // We distinguish them by the fact, that worker hooks are not executed via test.step()
    // See: https://github.com/microsoft/playwright/issues/33750
    // This may change in the future.
    return this.pwStep.category === 'test.step'
      ? messages.HookType.AFTER_TEST_CASE
      : messages.HookType.AFTER_TEST_RUN;
  }

  private getSourceReference(): messages.SourceReference {
    const { file, line, column } = this.pwStep.location || {};
    const uri = file ? path.relative(getConfigDirFromEnv(), file) : undefined;
    const location = line ? { line, column } : undefined;
    return { uri, location };
  }
}
