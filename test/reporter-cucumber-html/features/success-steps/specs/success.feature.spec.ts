import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('Feature tags', async ({ feature }) => {
  await expect(feature.getTags()).toHaveText(['@feature-tag']);
});

// Cucumber html-formatter does not show failed retries
// See: https://github.com/cucumber/react-components/issues/75
test('Scenario with retries', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given Action 1',
    'And fails until retry 1',
    'And Action 2',
  ]);
  await expect(scenario.getSteps()).toHaveCount(3);
  await expect(scenario.getSteps('passed')).toHaveCount(3);
});

test('Scenario with data table', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText(['Step with data table']);
  await expect(scenario.getDataTable().getByRole('cell')).toHaveText([
    'name',
    'value',
    'foo',
    'bar',
    'x',
    '42',
  ]);
});

test('Scenario with doc string', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toContainText(['Step with doc string']);
  await expect(scenario.getDocString()).toHaveText('some text');
});

test('Scenario with attachments', async ({ scenario }) => {
  await expect(scenario.getStepTitles()).toHaveText([
    'Given attach text via testInfo',
    'And attach text via attachments.push',
    'And attach non-ASCII text',
    'And attach text in nested step',
    'And attach image inline',
    'And attach image as file',
    'And attach stdout',
    'And attach buffer as stdout',
  ]);
  await expect(scenario.root).not.toContainText('my nested step');
  await expect(scenario.getAttachments()).toHaveText([
    'text attachment via testInfo|some text',
    'text attachment via attachments.push|another text',
    'non-ASCII attachment|Falló el caso',
    'text attachment in nested step|more text',
    'image attachment inline',
    'image attachment as file',
  ]);
  await scenario.expandAttachment();
  const logs = (await scenario.getLogs().allTextContents()).join('\n');
  expect(logs).toContain('123 some logs');
  expect(logs).toContain('logs from exec');
});

test('Scenario with all keywords and success hooks', async ({ scenario }) => {
  await expect(scenario.getSteps('passed')).toHaveCount(7);
  await expect(scenario.getStepTitles()).toHaveText([
    'Given Action 1',
    'And Action 2',
    'When Action 3',
    'And Action 4',
    'Then Action 5',
    'But Action 6',
    '* Action 7',
  ]);
});

test('Skipped scenario', async ({ scenario }) => {
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
});

test('Check doubled', async ({ feature }) => {
  const scenario = feature.getScenarioOutline('Check doubled');
  await expect(scenario.getStepTitles()).toHaveText([
    'Given Action 2',
    'Then Action 4',
    'Given Action 3',
    'Then Action 6',
    'Given Action 10',
    'Then Action 20',
  ]);
});
