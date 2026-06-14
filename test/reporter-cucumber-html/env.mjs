/**
 * Fake GitHub env variables to check meta.ci output in the Cucumber HTML reporter.
 */
export function getFakeGithubEnv() {
  return {
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_REPOSITORY: 'vitalets/playwright-bdd',
    GITHUB_RUN_ID: '12345',
    GITHUB_SHA: 'abcdef1234567890',
    GITHUB_HEAD_REF: 'my-feature-branch',
    GITHUB_REF: 'refs/heads/my-feature-branch',
    GITHUB_EVENT_NAME: 'push',
  };
}
