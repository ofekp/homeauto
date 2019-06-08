const mongoose = require('mongoose');
const moment = require('moment');

var Schema = mongoose.Schema;

var AccountSchema = new Schema(
    {
        user: {type: Schema.Types.ObjectId, ref: "User", required: true},
        account_type: {type: String, required: true, enum: ['RISCO'], default: 'RISCO'},
        user_name: {type: String, required: true, max: 100},
        password: {type: String, required: true, max: 100},
        additional_data: {type:String, max: 200},
        device_name: {type:String, required: true, max: 100},
        status: {type: String, required: true, enum: ['ACTIVE', 'DELETED', 'PAUSED'], default: 'ACTIVE'},
        created_date: {type: Date, default: Date.now},
    }
);

AccountSchema.virtual('account').get(function() {
    return this.account_type + " " + this.user_name + " created on " + moment(this.created_date).format() + " status " + this.status
});

AccountSchema.virtual('url').get(function () {
    return '/catalog/account/' + this._id;
});

module.exports = mongoose.model('Account', AccountSchema);