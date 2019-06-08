const User = require('../models/user');
const Account = require('../models/account');
const async = require('async');

const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Handle Account create on POST.
exports.account_create_post = [
    // validate
    body('user', 'User must be specified').isLength({min: 1}).trim(),
    body('user_name', 'Username must be specified').isLength({min: 1}).trim(),
    body('password', 'Password must be specified').isLength({min: 1}).trim(),
    body('device_name', 'Device name must be specified').isLength({min: 1}).trim(),

    // sanetize
    sanitizeBody('user').trim().escape(),
    sanitizeBody('device_name').trim(),

    // process request
    (req, res, next) => {
        const errors = validationResult(req);

        Account.findOne({ 'user': req.body.user, 'device_name': req.body.device_name }, function(err, account) {
            if (account != undefined) {
                res.send({ title: 'Create Account', errors: "Account with device name [" + req.body.device_name + "] already exists." });
                return;
            }

            var account = new Account({
                user: req.body.user,
                user_name: req.body.user_name,
                password: req.body.password,
                device_name: req.body.device_name,
            });
    
            if (!errors.isEmpty()) {
                res.send({ title: 'Create Account', errors: errors.array() })
                return;
            }
    
            account.save(function(err) {
                if (err) { return next(err); }
                // success
                res.send({ title: 'Create Account', url: account.url });
            });
        });
    }
];

// Display list of all Accounts.
exports.account_list = function(req, res, next) {
    Account.find()
        .sort([['account_type', 'ascending']])
        .exec(function(err, list_accounts) {
            if (err) { return next(err); }
            // successful
            res.send({ title: 'Account List', account_list: list_accounts });
        });
};

// Handle Account delete on POST.
exports.account_delete_post = function(req, res, next) {
    Account.findByIdAndRemove(req.body.id, function(err) {
        if (err) { return next(err); }
        res.send({ title: 'Delete Account', account: req.body.id });
    });
};