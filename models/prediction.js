let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let db = require("./db");
let PredictionSchema = new Schema({
    datasets_id: {type: Schema.Types.ObjectId},
    name: {type: String},
    models: [],
    status: {type: Number, default: 0}, // 0未开启/1正在开启/已开启
    pid: {type: Number},
    create_at: {type: Date, default: Date.now}
});
// DataSchema.index({status: -1, severity: -1, attr: 1, pinyin: 1});
let model = db.model('prediction', PredictionSchema);
module.exports = {
    model: model,
    create: async (object) => {
        const user = new model(object);
        await user.save();
    }
};