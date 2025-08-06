import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { CustomTextarea } from './components';

Given('Mounted input component', async ({ mount }) => {
  // use <textarea> instead of <input>
  // see: https://github.com/microsoft/playwright/issues/28566
  await mount(<textarea data-testid="textField" />);
});

When(
  'I type into field {string} value {string}',
  async ({ page }, testId: string, value: string) => {
    await page.getByTestId(testId).fill(value);
  },
);

Then('Field {string} has value {string}', async ({ page }, testId: string, value: string) => {
  await expect(page.getByTestId(testId)).toHaveValue(value);
});

Given(
  'Mounted button with an event handler that record how many times it was pressed',
  async ({ mount, world }) => {
    await mount(
      <button type="button" data-testid="button" onClick={() => (world.clickedTimes += 1)} />,
    );
  },
);

When('I press the button', async ({ page }) => {
  await page.getByTestId('button').click();
});

Then('the recorded number of times the button was pressed is {int}', async ({ world }, arg) => {
  expect(world.clickedTimes).toBe(arg);
});

Given('Mounted custom textarea', async ({ mount }) => {
  // limitation: use Component function call instead of JSX render: mount(<CustomTextarea />)
  await mount(
    CustomTextarea({
      style: { color: 'green' },
      'data-testid': 'custom-textarea',
    }),
  );
});
