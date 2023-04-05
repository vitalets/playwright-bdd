module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/steps/**/*.{ts,js}'],
    requireModule: ['ts-node/register'],
    publishQuiet: true,
  },
};
