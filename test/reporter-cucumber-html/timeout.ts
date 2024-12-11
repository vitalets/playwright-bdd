// Test timeout
// Keep in separate file, b/c it is also used in test/reporter-cucumber-merge
// - don't make it too small, as PW needs time to save trace, screenshot, etc.
// - don't make it too big, as then timeout-tests take more time
// if define this timeout as @timeout tag, timeout in after fixture does not work
export const testTimeout = process.platform === 'win32' ? 4000 : 2000;
