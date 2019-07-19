var express = require('express');
var router = express.Router();

// Require controller modules.
var home_keeper_controller = require('../controllers/homeKeeperController');

/// HOME-KEEPER ROUTES ///
router.post('/home-keeper', home_keeper_controller.index);

module.exports = router;