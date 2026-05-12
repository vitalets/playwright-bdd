import { normalize } from 'node:path';
import { expect } from '@playwright/test';
import { expectAttachmentTexts, fixtureHookTitleRegexp } from '../../../check-report/helpers';
import { test } from '../../../check-report/fixtures';

test('error in anonymous before hook', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText(['Before: BeforeEach hook', 'Given Action 1']);
  await scenario.expandHooks('before');
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.root).toContainText(normalize('features/before-hook/steps.ts'));
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-anonymous-before-hook']);
  await expect(scenario.getErrors()).toContainText([`steps.ts`]);
});

test('error in named before hook', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Before: failing named before hook',
    'Given Action 1',
  ]);
  await scenario.expandHooks('before');
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.root).toContainText(normalize('features/before-hook/steps.ts'));
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getTags()).toContainText(['@failing-named-before-hook']);
  await expect(scenario.getErrors()).toContainText([`steps.ts`]);
});

test('error in nested step in before hook', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText(['Before: my step', 'Given Action 1']);
  await scenario.expandHooks('before');
  await expect(scenario.getAttachments()).toContainText(['screenshot']);
  await expect(scenario.getTraceLinks()).toHaveCount(1);
  await expect(scenario.root).toContainText(normalize('features/before-hook/steps.ts'));
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(1);
  await expect(scenario.getErrors()).toContainText([`steps.ts`]);
});

test('error in fixture setup (no step)', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    fixtureHookTitleRegexp('BeforeAll', 'fixtureWithErrorInSetup'),
    'Given step that uses fixtureWithErrorInSetup',
    'When Action 1',
  ]);
  await scenario.expandHooks('before');
  await expect(scenario.root).toContainText(normalize('features/before-hook/fixtures.ts'));
  await expectAttachmentTexts(scenario.getAttachments(), [
    'my attachment|outside step',
    'my attachment|in step',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getErrors()).toContainText(['fixtures.ts']);
});

test('error in fixture setup (with step)', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'BeforeAll: step inside fixture',
    'Given step that uses fixtureWithErrorInSetupStep',
    'When Action 2',
  ]);
  await scenario.expandHooks('before');
  await expect(scenario.root).toContainText(normalize('features/before-hook/fixtures.ts'));
  await expectAttachmentTexts(scenario.getAttachments(), [
    'my attachment|in step',
    'my attachment|outside step',
    'screenshot',
  ]);
  await expect(scenario.getSteps('failed')).toHaveCount(1);
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
  await expect(scenario.getErrors()).toContainText(['fixtures.ts']);
});
