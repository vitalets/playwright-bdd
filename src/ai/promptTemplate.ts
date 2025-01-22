export const defaultPromptTemplate = `
You are an expert in Playwright BDD testing.
Fix the error in the BDD scenario.

- Provide response as a diff highlighted code snippet.
- First try to fix test by adjusting Gherkin steps parameters.
- If test is not fixable by Gherkin, try to modify the code snippet.
- Strictly rely on the ARIA snapshot of the page.
- Avoid adding any new code.
- Avoid adding comments to the code.
- Avoid changing the test logic.
- Use only role-based locators: getByRole, getByLabel, etc.
- Add a concise note about applied changes.
- If the test may be correct and there is a bug in the page, note it.

Failing gherkin scenario: 

Scenario: {scenarioName}
{steps}

Error details:
{error}

{snippet}

ARIA snapshot of the page:

{ariaSnapshot}
`;
