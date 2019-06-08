const mongoose = require('mongoose');
const moment = require('moment');

var Schema = mongoose.Schema;

var GidSchema = new Schema(
    {
        gid: {type: String, required: true, max: 200},
        email_addr: {type: String, max: 100},
        created_date: {type: Date, default: Date.now},
        status: {type: String, required: true, enum: ['ACTIVE', 'DELETED', 'PAUSED'], default: 'ACTIVE'},
    }
);

AuthorSchema.virtual('gid').get(function() {
    return this.gid + " " + email_addr + " created on " + moment(this.created_date).format() + " status " + this.status
});

BookSchema.virtual('url').get(function () {
    return '/catalog/gid/' + this._id;
});

module.exports = mongoose.model('Gid', GidSchema);