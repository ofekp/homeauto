const User = require('../models/user');
const Account = require('../models/account');
const async = require('async');
const jwt_decode = require('jwt-decode');
const TokenGenerator = require('uuid-token-generator');

const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');  

// Handle user create on POST.
exports.user_create_post = [
    // validate fields
    body('email').isLength({ min: 3}).trim().withMessage('Email address must be specified.')
        .isEmail().withMessage('Email must be valid.'),

    // sanitize fields
    sanitizeBody('email').trim().escape(),

    // process the request
    (req, res, next) => {
        // extract validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // there are errors
            res.send({ title: 'Create User', error: errors.array() });
            return;
        }

        // data from the form is valid
        var user = new User({
            email: req.body.email,
            name: req.body.name,
        });

        user.save(function(err) {
            if (err) { return next(err) }
            // successful
            res.send({ title: 'Create User', url: user.url });
        });
    }
];

// Handle User delete on POST.
exports.user_delete_post = function(req, res, next) {
    async.waterfall([
        function(callback) {
            User.findOne({ 'email': req.body.email }, function(err, user) {
                callback(null, user);
            });
        },
        function(user, callback) {
            if (user == undefined) {
                res.send({ title: 'Delete User', error: "User could not be found"});
                return;
            }
            Account.find({ 'user': user.id }, function(error, accounts) {
                callback(null, { user: user,  accounts: accounts});
            })
        }
    ], function(err, results) {
        // this verifies that the author exists
        if (err) { return next(err); }

        // delete all user accounts
        let del_accounts_count = 0;
        console.log(results);
        if (results.accounts !== null && results.accounts.length > 0) {
            for (account in results.accounts) {
                Account.findByIdAndRemove(account.id, function deleteAccount(err) {
                    if (err) { return next(err); }
                    del_accounts_count += 1;
                });
            }
        }

        // delete user
        User.findByIdAndRemove(results.user.id, function deleteUser(err) {
            if (err) { return next(err); }
            res.send({ title: 'Delete User', user: results.user.id, num_of_del_accounts: del_accounts_count });
        });
    });
};

// Display list of all Users.
exports.user_list = function(req, res, next) {
    User.find()
        .sort([['join_date', 'ascending']])
        .exec(function(err, list_users) {
            if (err) { return next(err); }
            // successful
            res.send({ title: 'User List', user_list: list_users });
        });
};

// Display detail page for a specific User.
exports.user_detail = function(req, res, next) {
    async.waterfall([
        function(callback) {
            User.findOne({ 'email': req.body.email }, function(err, user) {
                callback(null, user);
            });
        },
        function(user, callback) {
            if (user == undefined) {
                res.send({ title: 'User Detail', error: "User could not be found"});
                return;
            }
            Account.find({ 'user': user.id }, function(err, accounts) {
                callback(null, { user: user,  accounts: accounts });
            });
        }
    ], function(err, results) {
        if (err) { return next(err) }
        if (results.user == null) {
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        // success
        res.send({ title: 'User Detail', user: results.user, accounts: results.accounts } );
    });
};