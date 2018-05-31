let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let db = require("./db");
let BayesSchema = new Schema({
    alpha: {type: Number},
    fit_prior: {type: Boolean},
    create_at: {type: Date, default: Date.now}
});
let model = db.model('model', BayesSchema);
module.exports = {
    model: model,
    create: async (params) => {
        const query = {
            alpha: 1,
            fit_prior: true
        };
        if (params.alpha !== undefined) {
            query.alpha = parseFloat(params.alpha)
        }
        if (params.fit_prior !== undefined) {
            query.fit_prior = params.fit_prior
        }
        const count = await model.count(query);
        if (count) {
            throw "已经存在参数组合"
        }
        const user = new model(query);
        return await user.save();
    }
};