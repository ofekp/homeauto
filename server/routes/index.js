var express = require('express');
var router = express.Router();

// Google site verification
// to see Google verified properties got to https://www.google.com/webmasters/verification/home?hl=en
// that domain must be in an OAuth.2.0 credential defined in https://console.developers.google.com/apis/credentials
// inside "Authorised JavaScript origins"
router.get('/googlec923142279c08706.html', function(req, res) {
  res.send('google-site-verification: googlec923142279c08706.html');
});

// GET home page
router.get('/', function(req, res) {
  res.redirect('/catalog');
});

module.exports = router;
