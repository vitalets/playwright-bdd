module.exports = {
  default: {
    paths: ['*.feature'],
    require: ['steps.ts'],
    requireModule: ['ts-node/register'],
  },
};
