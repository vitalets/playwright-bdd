import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { fixtureHookTitleRegexp } from '../../../check-report/helpers';
import { test } from '../../../check-report/fixtures';

test('error in anonymous after hook', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given step with page',
    'After: AfterEach hook',
  ]);
  await scenario.expandHooks('after');
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.root).toContainText(normalize('features/after-hook/steps.ts'));
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-after-hook']);
  await expect(scenario.getErrors()).toContainText([`steps.ts`]);
});

test('error in named after hook', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given step with page',
    'After: failing named after hook',
  ]);
  await scenario.expandHooks('after');
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.root).toContainText(normalize('features/after-hook/steps.ts'));
  await expect(scenario.getSteps('passed')).toHaveCount(2);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-after-hook']);
  await expect(scenario.getErrors()).toContainText([`steps.ts`]);
});

test('error in nested step in after hook', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText(['Given step with page', 'After: my step']);
  await scenario.expandHooks('after');
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.root).toContainText(normalize('features/after-hook/steps.ts'));
  await expect(scenario.getSteps('passed')).toHaveCount(3);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([`steps.ts`]);
});

test('error in fixture teardown (no step)', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given step with page',
    'Given step that uses fixtureWithErrorInTeardown',
    'When Action 1',
    fixtureHookTitleRegexp('AfterAll', 'fixtureWithErrorInTeardown'),
  ]);
  await scenario.expandHooks('after');
  await expect(scenario.root).toContainText(normalize('features/after-hook/fixtures.ts'));
  await expect(scenario.getAttachments()).toContainText(['my attachment|after use', 'screenshot']);
  await expect(scenario.getSteps('passed')).toHaveCount(5);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['fixtures.ts']);
});

test('error in fixture teardown (with step)', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given step with page',
    'Given step that uses fixtureWithErrorInTeardownStep',
    'When Action 1',
    'After: step inside fixture',
  ]);
  await scenario.expandHooks('after');
  await expect(scenario.root).toContainText(normalize('features/after-hook/fixtures.ts'));
  await expect(scenario.getAttachments()).toContainText(['my attachment|in step', 'screenshot']);
  await expect(scenario.getSteps('passed')).toHaveCount(6);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(0);
  await expect(scenario.getErrors()).toContainText(['fixtures.ts']);
});
