module.exports = {
  default: {
    paths: ['test/features/*.feature'],
    require: ['test/steps*.ts'],
    requireModule: ['ts-node/register'],
    // dynamically change config for some tests
    ...JSON.parse(process.env.CUCUMBER_CONFIG || '{}'),
  },
};
