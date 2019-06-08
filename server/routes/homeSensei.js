var express = require('express');
var router = express.Router();

// Require controller modules.
var home_auto_controller = require('../controllers/homeAutoController');

/// HOME-SENSEI ROUTES ///
router.post('/home-auto', home_auto_controller.index);

module.exports = router;