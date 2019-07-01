const mongoose = require('mongoose');
const moment = require('moment');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        email: {type: String, required: true, max: 100},
        name: {type: String, max: 60},
        status: {type: String, required: true, enum: ['ACTIVE', 'DELETED', 'PAUSED'], default: 'ACTIVE'},
        join_date: {type: Date, default: Date.now},
    }
);

UserSchema.virtual('user').get(function() {
    return this.email + " joined " + moment(this.join_date).format() + " " + this.locale + " status " + this.status;
});

UserSchema.virtual('url').get(function () {
    return '/catalog/user/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);
