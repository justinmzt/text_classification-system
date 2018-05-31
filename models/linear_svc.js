let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let db = require("./db");
let LinearSVCSchema = new Schema({
    tol: {type: Number},
    C: {type: Number},
    penalty: {type: String},
    loss: {type: String},
    create_at: {type: Date, default: Date.now}
});
let model = db.model('svc_model', LinearSVCSchema);
module.exports = {
    model: model,
    create: async (params) => {
        const query = {
            tol: 0.0001,
            fit_prior: true,
            penalty: "l2",
            loss: "squared_hinge"
        };
        if (params.tol !== undefined) {
            query.tol = parseFloat(params.tol)
        }
        if (params.C !== undefined) {
            query.C = parseFloat(params.C)
        }
        if (params.penalty !== undefined) {
            query.penalty = params.penalty
        }
        if (params.loss !== undefined) {
            query.loss = params.loss
        }
        const count = await model.count(query);
        if (count) {
            throw "已经存在参数组合"
        }
        const user = new model(query);
        return await user.save();
    }
};