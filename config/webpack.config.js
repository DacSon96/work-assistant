'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      contentScript: [PATHS.src + '/tools.js', PATHS.src + '/app.js'],
      site: [PATHS.src + '/1688.js', PATHS.src + '/taobao.js', PATHS.src + '/tmall.js'],
      background: PATHS.src + '/background.js',
      script: PATHS.src + '/script.js'
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
