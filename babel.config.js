module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    ['transform-define', {
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
    }]
  ]
};
