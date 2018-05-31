let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let db = require("./db");
let DataSchema = new Schema({
    name: {type: String},
    train_file: {type: String},
    test_file: {type: String},
    pid: {type: Number},
    categories: [],
    status: {type: Number, default: 0}, // 0未开启/1正在开启/已开启
    create_at: {type: Date, default: Date.now}
});
let model = db.model('dataset', DataSchema);
module.exports = {
    model: model,
    create: async (object) => {
        const user = new model(object);
        await user.save();
    }
};