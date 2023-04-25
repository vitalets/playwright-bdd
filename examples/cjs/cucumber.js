module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['steps/**/*.{ts,js}'],
    publishQuiet: true,
  },
};
