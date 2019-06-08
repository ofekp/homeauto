var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// helpful website: https://medium.com/google-developer-experts/how-to-use-google-sign-in-for-the-assistant-b818f3de9211

const {
    dialogflow,
    SignIn
} = require("actions-on-google");
  
const app = dialogflow({
    clientId: "130611883717-kh5ctlhunh70i9jpajorsplf18lads0n.apps.googleusercontent.com"
});

app.intent("Risco", conv => {
    conv.ask("Hi, welcome to Home Sensei.");
});

app.intent("App Welcome Message", conv => {
    conv.ask("Hi, welcome to Home Sensei.");
});

app.intent("App Start Sign-In", conv => {
    conv.ask(new SignIn("To personalize Home Sensei"));
});

app.intent('App Get Sign-In', (conv, params, signin) => {
    if (signin.status !== 'OK') {
        return conv.ask(new SignIn('To personalize Home Sensei, you need to sign in before using the app.'));
    }
    // const access = conv.user.access.token;
    const email = conv.user.email
    console.log(email);
    console.log(conv.user);
    // possibly do something with access token
    return conv.ask('Great! Thanks for signing in.');
});

exports.index = app;

//exports.index = function(req, res) {

    //console.log(req.body);

    //res.set('Content-Type', 'application/json');
    //res.send({ "speech": "wHATEVER", "displayText": "wHATEVER", "source": "sensei-webhook" })
    //return res;

    // async.parallel({
    //     book_count: function (callback) {
    //         Book.countDocuments({}, callback);
    //     },
    //     book_instance_count: function (callback) {
    //         BookInstance.countDocuments({}, callback);
    //     },
    //     book_instance_available_count: function (callback) {
    //         BookInstance.countDocuments({status:'Available'}, callback);
    //     },
    //     author_count: function (callback) {
    //         Author.countDocuments({}, callback);
    //     },
    //     genre_count: function (callback) {
    //         Genre.countDocuments({}, callback);
    //     },
    // }, function(err, results) {
    //     // res.render('index', { title: 'Local Library Home', error: err, data: results })
    //     res.send({ title: 'Local Library Home', error: err, data: results })
    // });
//};

