// config-overrides.js
const { override, addWebpackModuleRule } = require('customize-cra');

module.exports = addWebpackModuleRule({
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/,
})