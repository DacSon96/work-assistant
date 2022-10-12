'use strict';

const path = require('path');
const pjson = require('../package.json');

const PATHS = {
  src: path.resolve(__dirname, '../src'),
  build: path.resolve(__dirname, '../build/' + pjson.product + "_" + pjson.version),
};

module.exports = PATHS;
