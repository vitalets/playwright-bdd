// test timeout
// keep in separate file, b/c it is also used in test/reporter-cucumber-merge
// don't reduce test timeout as it produces unreliable errors
// if define this timeout as @timeout tag, timeout in after fixture does not work
export const testTimeout = process.env.CI ? (process.platform === 'win32' ? 3500 : 1500) : 1000;
