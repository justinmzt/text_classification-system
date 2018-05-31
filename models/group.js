let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let db = require("./db");
let GroupSchema = new Schema({
    datasets_id: {type: Schema.Types.ObjectId},
    name: {type: String},
    trains: [],
    create_at: {type: Date, default: Date.now}
});
let model = db.model('group', GroupSchema);
module.exports = {
    model: model,
    create: async (object) => {
        const user = new model(object);
        await user.save();
    }
};