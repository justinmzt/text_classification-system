// 配置单一出口
'use strict';

// 获取各项配置
var database    = require('./database');
var backend     = require('./backend');


var config = {
  db         : database,
  backend    : backend,
};

module.exports = config;
