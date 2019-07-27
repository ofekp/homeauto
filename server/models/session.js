const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SessionSchema = new Schema(
    {
        user: {type: Schema.Types.ObjectId, ref: "User", required: true},
        user_sid: {type: String, required: true},
        created_date: {type: Date, default: Date.now},
    }
);

module.exports = mongoose.model('Session', SessionSchema);