/**
 * mongoose连接
 */
'use strict';

let mongoose = require('mongoose');
const config = require('../config');

let db = mongoose.createConnection(config.db.mongo);

if (!db) {
    db = null;
}

module.exports = db;