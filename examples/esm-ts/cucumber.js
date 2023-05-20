export default {
  paths: ['features/**/*.feature'],
  import: ['steps/**/*.{ts,js}'],
  // requireModule does not work for registering ts-node/esm, use NODE_OPTIONS instead
  // See: https://github.com/cucumber/cucumber-js/blob/main/docs/transpiling.md#with-ts-node
  publishQuiet: true,
};
