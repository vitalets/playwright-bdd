export default {
  paths: ['features/**/*.feature'],
  import: ['features/steps/**/*.{ts,js}'],
  requireModule: ['ts-node/register'],
  publishQuiet: true,
};
