module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/steps/**/*.{ts,js}'],
    publishQuiet: true,
  },
};
