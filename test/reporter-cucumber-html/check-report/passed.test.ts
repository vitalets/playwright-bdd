import { test, expect } from '@playwright/test';
import { getFeature, getScenario, openReport } from './helpers';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

// Cucumber html-formatter does not show failed retries
// See: https://github.com/cucumber/react-components/issues/75
test('Scenario: Scenario with retries', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with retries');
  await expect(scenario.getSteps()).toHaveText([
    'GivenAction 1',
    'Andfails until retry 1',
    'AndAction 2',
    '', // empty step b/c we have 'After Hooks' hook added to the testCase b/c of screenshot in failed attempt
  ]);
  await expect(scenario.getSteps()).toHaveCount(4);
  await expect(scenario.getSteps('passed')).toHaveCount(3);
});

test('Scenario: Scenario with data table', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with data table');
  await expect(scenario.getSteps()).toContainText(['Step with data table']);
  await expect(scenario.getDataTable().getByRole('cell')).toHaveText([
    'name',
    'value',
    'foo',
    'bar',
    'x',
    '42',
  ]);
});

test('Scenario: Scenario with doc string', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with doc string');
  await expect(scenario.getSteps()).toContainText(['Step with doc string']);
  await expect(scenario.getDocString()).toHaveText('some text');
});

test('Scenario: Scenario with attachments', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with attachments');
  await expect(scenario.getSteps()).toContainText([
    'attach text',
    'attach image inline',
    'attach image as file',
  ]);
  await expect(scenario.getAttachments()).toHaveText([
    'text attachmentsome text', // no space between 'attachment' and 'some'
    'image attachment inline',
    'image attachment as file',
    'stdout123 some logs',
  ]);
});

test('Scenario: Scenario with all keywords and success hooks', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with all keywords and success hooks');
  await expect(scenario.getSteps('passed')).toHaveCount(7);
  await expect(scenario.getSteps()).toHaveText([
    '', // before hook
    'GivenAction 1',
    'AndAction 2',
    'WhenAction 3',
    'AndAction 4',
    'ThenAction 5',
    'ButAction 6',
    '*Action 7',
    '', // after hook
  ]);
});

test('Scenario: Skipped scenario', async ({ page }) => {
  const scenario = getScenario(page, 'Skipped scenario');
  await expect(scenario.root).not.toBeVisible();
});

test('Scenario Outline: Check doubled', async ({ page }) => {
  const scenario = getFeature(page).getScenarioOutline('Check doubled');
  await expect(scenario.getSteps()).toContainText(['GivenAction <start>', 'ThenAction <end>']);
  await expect(scenario.getExamples().nth(0).getByRole('cell')).toContainText([
    ' ',
    'start',
    'end',
    '',
    '2',
    '4',
    '',
    '3',
    '6',
  ]);
  await expect(scenario.getExamples().nth(1).getByRole('cell')).toContainText([
    ' ',
    'start',
    'end',
    '',
    '10',
    '20',
  ]);
});
