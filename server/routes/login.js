var express = require('express');
var router = express.Router();

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.WEBAPP_CLIENT_ID);
async function verify(tokenId) {
  const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.WEBAPP_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  return payload.email;
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
}

router.post('/', async function(req, res) {
    if (req.session.email) {
        res.send("You are already logged in.")
        return;
    }

    try {
        const email = await verify(req.headers['token-id'])
        req.session.email = email
    } catch (error) {
        res.status(401);
        res.send("Unautorized")
        return;
    }

    if (req.session.email) {
        res.send("You are now logged in.")
        return;
    }

    res.status(401)
    res.send("Error while logging in")
});

router.post('/revoke', async function(req, res) {
    req.session.destroy();
    res.send("Session revoked.")
})

module.exports = router;