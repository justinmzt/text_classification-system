let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let db = require("./db");
let TrainSchema = new Schema({
    datasets_id: {type: Schema.Types.ObjectId},
    model_id: {type: Schema.Types.ObjectId},
    type: {type: String},
    status: {type: Number, default: 0}, // 0未开启/1正在训练/训练完成
    create_at: {type: Date, default: Date.now}
});
let model = db.model('train', TrainSchema);
module.exports = {
    model: model,
    create: async (object) => {
        const user = new model(object);
        await user.save();
    }
};