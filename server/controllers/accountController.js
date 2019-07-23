const User = require('../models/user');
const Account = require('../models/account');
const async = require('async');
const risco = require('./risco');

const {body, validationResult, sanitizeBody} = require('express-validator');
//const {sanitizeBody} = require('express-validator/filter');

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
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.send({ title: 'Create Account', errors: errors.array() })
        }

        updatedAccount = {
            user: req.body.user,
            user_name: req.body.user_name,
            password: req.body.password,
            additional_data: JSON.stringify(req.body.additional_data),
            device_name: req.body.device_name
        }
        
        const account = await Account.updateOne(
            {'user': req.body.user, 'device_name': req.body.device_name },
            updatedAccount,
            { upsert : true }
        );

        if (!account) {
            return res.send({ title: 'Create Account', errors: "error while creating a device" });
        }

        return res.send({ title: 'Create Account', account: account });
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

// get the current state of the device
exports.account_get_state = async (req, res, next) => {
    Account.findById(req.body.device_id, async function(err, account) {
        if (err) { return next(err); }
        const riscoState = await risco.getState(null, account);
        if (!riscoState) {
            res.status(404);
            return res.send({ title: 'Get Device State', error: "Error while getting the device state" })
        }
        res.send({ title: 'Get Device State', state: riscoState });
    });
};

// set the state of the device
exports.account_set_state = async (req, res, next) => {
    Account.findById(req.body.device_id, async function(err, account) {
        if (err) { return next(err); }
        const riscoState = await risco.action(null, account, req.body.state);
        res.send({ title: 'Set Device State', state: riscoState });
    });
};