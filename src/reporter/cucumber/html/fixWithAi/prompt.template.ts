export const promptTemplate = `
You are an expert in Playwright BDD testing.
Fix the error in the test.

- Provide response as a diff highlighted code snippet.
- Strictly rely on the ARIA snapshot of the page.
- Avoid adding any new code.
- Avoid adding comments to the code.
- Avoid changing the test logic.
- Try to change BDD steps parameter values when possible.
- Use only role-based locators: getByRole, getByLabel, etc.
- Add a concise note about applied changes.
- If the test may be correct and there is a bug in the page, note it.

Failed scenario: {scenarioName}
Steps:
{steps}

{error}

{snippet}

ARIA snapshot of the page:

{ariaSnapshot}
`;
