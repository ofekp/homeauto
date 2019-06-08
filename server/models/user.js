const mongoose = require('mongoose');
const moment = require('moment');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        gid: {type: String, required: true, max: 200},
        email: {type: String, required: true, max: 100},
        locale: {type:String, max: 10},
        status: {type: String, required: true, enum: ['ACTIVE', 'DELETED', 'PAUSED'], default: 'ACTIVE'},
        join_date: {type: Date, default: Date.now},
    }
);

UserSchema.virtual('user').get(function() {
    return gid + " (" + this.email + ") joined " + moment(this.join_date).format() + " " + this.locale + " status " + this.status;
});

UserSchema.virtual('url').get(function () {
    return '/catalog/user/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);
