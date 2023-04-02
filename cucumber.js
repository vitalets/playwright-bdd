module.exports = {
  default: {
    // dynamically change config from tests
    ...JSON.parse(process.env.CUCUMBER_CONFIG),
    requireModule: ['ts-node/register'],
  },
};
