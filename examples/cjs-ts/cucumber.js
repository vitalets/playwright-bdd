module.exports = {
  default: {
    require: ['features/steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    publishQuiet: true,
  },
};
