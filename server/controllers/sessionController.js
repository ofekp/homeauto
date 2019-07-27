const Session = require('../models/session');
const User = require('../models/user');

// Handle Session create on POST.
exports.session_create = async function(email, user_sid) {
    const user = await User.find({ 'email': email })
    console.log("session user id " + user.id);
    session = {
        user: user.id,
        user_sid: user_sid
    }

    const session = await Session.updateOne(
        {'user': req.body.user, 'device_name': req.body.device_name },
        session,
        { upsert : true }
    );

    if (!session) {
        return null;
    }

    return session;
}

// Handle Session delete on POST.
exports.session_delete_post = function(user_sid) {
    Session.findOneAndRemove({ 'user_sid': user_sid }, function(err) {
        if (err) { return next(err); }
        return { session: user_sid };
    });
};

// Display list of all Sessions.
exports.session_list = function() {
    Session.find()
        .populate('user')
        .exec(function(err, list_sessions) {
            if (err) { return next(err); }
            // successful
            return { session_list: list_sessions };
        });
};