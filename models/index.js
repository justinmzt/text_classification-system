exports.DB                      = require('./db');
exports.Datasets                    = require('./datasets');
exports.Group                    = require('./group');
exports.Train                    = require('./train');
exports.Prediction                    = require('./prediction');

exports.Model                    = {
    "MNB": require('./naive_bayes'),
    "LinearSVC": require('./linear_svc')
};
