// Fixes error with not exported sourceMapSupport from playwright
declare module '@playwright/test/lib/utilsBundle' {
  export const sourceMapSupport: {
    wrapCallSite: (frame: NodeJS.CallSite) => NodeJS.CallSite;
  };
}
