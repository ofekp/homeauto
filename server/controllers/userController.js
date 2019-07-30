const User = require('../models/user');
const Account = require('../models/account');
const async = require('async');

const {check, validationResult, sanitizeBody} = require('express-validator');
//const {body, validationResult} = require('express-validator/check');
//const {sanitizeBody} = require('express-validator/filter');  

// Handle user create on POST.
exports.user_create_post = async function(req, res, next) {
    if (!req.session.email) {
        // there are errors
        res.status(401)
        res.send("Unautorized.");
        return;
    }

    // data from the form is valid
    var user = new User({
        email: req.session.email,
        name: req.body.name,
    });

    user.save(function(err) {
        if (err) { return next(err) }
        // successful
        res.send({ title: 'Create User', user: user });
    });
}

// Handle User delete on POST.
exports.user_delete_post = function(req, res, next) {
    async.waterfall([
        function(callback) {
            if (!req.session.email) {
                res.status(401)
                res.send("Unauthorized")
                return
            } else if (req.session.email === process.env.ADMIN_EMAIL && req.body && req.body.id) {
                // ADMIN
                User.findById(req.body.id, function(err, user) {
                    callback(null, user)
                });
            } else {
                User.findOne({ 'email': req.session.email }, function(err, user) {
                    callback(null, user)
                });
            }
        },
        function(user, callback) {
            if (!user) {
                res.status(404)
                res.send({ title: 'Delete User', error: "User [" + req.session.email + "] could not be found"})
                return;
            }
            Account.find({ 'user': user.id }, function(error, accounts) {
                callback(null, { user: user,  accounts: accounts })
            })
        }
    ], function(err, results) {
        // this verifies that the author exists
        if (err) { 
            err.status = 500;
            return next(err);
        }

        // delete all user accounts
        let del_accounts_count = 0;
        if (results.accounts !== null && results.accounts.length > 0) {
            for (account in results.accounts) {
                Account.findByIdAndRemove(account.id, function deleteAccount(err) {
                    if (err) { 
                        err.status = 500;
                        return next(err);
                    }
                    del_accounts_count += 1;
                });
            }
        }

        // delete user
        User.findByIdAndRemove(results.user.id, function deleteUser(err) {
            if (err) { 
                err.status = 500;
                return next(err);
            }
            res.send({ title: 'Delete User', user: results.user.id, num_of_del_accounts: del_accounts_count });
        });
    });
};

// Display list of all Users.
exports.user_list = function(req, res, next) {
    if (req.session.email && req.session.email === process.env.ADMIN_EMAIL) {
        // ADMIN
        User.find()
        .sort([['join_date', 'ascending']])
        .exec(function(err, list_users) {
            if (err) { return next(err); }
            // successful
            res.send({ title: 'User List', user_list: list_users });
        });
    } else {
        User.find({ 'email': req.session.email })
        .sort([['join_date', 'ascending']])
        .exec(function(err, list_users) {
            if (err) { return next(err); }
            // successful
            res.send({ title: 'User List', user_list: list_users });
        });
    }
};

// Display detail page for a specific User.
exports.user_detail = function(req, res, next) {
    async.waterfall([
        function(callback) {
            if (!req.session.email) {
                res.status(401);
                res.send("Unauthorized");
                return;
            }
            User.findOne({ 'email': req.session.email }, function(err, user) {
                callback(null, user);
            });
        },
        function(user, callback) {
            if (!user) {
                res.status(404);
                res.send({ title: 'User Detail', error: "User could not be found"});
                return;
            }
            Account.find({ 'user': user.id }, function(err, accounts) {
                callback(null, { user: user,  accounts: accounts });
            });
        }
    ], function(err, results) {
        if (err) { 
            err.status = 500
            return next(err)
        }
        if (!results.user) {
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        // success
        res.send({ title: 'User Detail', user: results.user, accounts: results.accounts } );
    });
};