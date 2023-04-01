module.exports = {
  default: {
    require: [process.env.CUCUMBER_REQUIRE],
    requireModule: ['ts-node/register'],
  },
};
