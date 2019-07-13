var express = require('express');
var router = express.Router();

// Require controller modules.
var home_auto_controller = require('../controllers/homeAutoController');
var user_controller = require('../controllers/userController');
var account_controller = require('../controllers/accountController');

// ****************
// Action-on-Google
// ================

/// HOME-AUTO Action-on-Google ROUTES ///
router.post('/', home_auto_controller.index);

// ****
// User
// ====

// POST request for creating a User.
router.post('/user/create', user_controller.user_create_post);

// GET request for list of all User items.
router.get('/users', user_controller.user_list);

// POST request to delete User.
router.post('/user/delete', user_controller.user_delete_post);

// POST request for creating a User.
router.post('/user/detail', user_controller.user_detail);

// *******
// Account
// =======

// POST request for creating an Account.
router.post('/account/create', account_controller.account_create_post);

// GET request for list of all User items.
router.get('/accounts', account_controller.account_list);

// POST request to delete Account.
router.post('/account/delete', account_controller.account_delete_post);

// POST get the device current state
router.post('/device/getState', account_controller.account_get_state);

// POST set the device state
router.post('/device/setState', account_controller.account_set_state);

module.exports = router;