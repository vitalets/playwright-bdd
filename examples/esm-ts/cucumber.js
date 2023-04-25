export default {
  paths: ['features/**/*.feature'],
  import: ['steps/**/*.{ts,js}'],
  requireModule: ['ts-node/register'],
  publishQuiet: true,
};
