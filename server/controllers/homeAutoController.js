const User = require('../models/user');
const Account = require('../models/account');
const async = require('async');
const risco = require('./risco');
const fs = require("fs");

const configPath = './server.cfg';
const config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
const actionOnGoogleClientId = config.actionOnGoogle.clientId;

const {
    dialogflow,
    SignIn,
    Permission
} = require("actions-on-google");
  
const app = dialogflow({
    clientId: actionOnGoogleClientId
});

const getUser = async(gid) => {
    return await User.findOne({ 'gid': gid }).exec();
}

const getAccounts = async(user_id, account_type) => {
    return await Account.find({ 'user': user_id, 'account_type': account_type }).exec();
}

const createUser = async(gid, email, locale) => {
    // data from the form is valid
    var user = new User({
        gid: gid,
        email: email,
        locale: locale,
    });

    await user.save(function(err) {
        if (err) { return false }
        // successful
        return true;
    });
}

const createAccount = async(user_id, account_type, user_name, password, additional_data, device_name) => {

    // currently only allowing one device of each type
    //account = await Account.findOne({ 'user': user.id, 'account_type': account_type }).exec();
    //console.log(account);

    // if (account === undefined) {
    //     account = new Account();
    // } else {
    //     account
    // }

    // console.log("==>");
    // console.log(user_id);
    // console.log(account_type);
    // console.log(user_name);
    // console.log(password);
    // console.log(additional_data);
    // console.log(device_name);

    await Account.updateOne( 
        { 'user': user.id, 'account_type': account_type },
        {
            user: user_id,
            account_type: account_type,
            user_name: user_name,
            password: password,
            additional_data: JSON.stringify(additional_data),
            device_name: device_name,
        },
        { upsert : true }).exec();

    // await account.save(function(err) {
    //     if (err) {
    //         console.log(err);
    //         return err; 
    //     }
    //     // success
    //     return;
    // });
}

const deleteAccount = async(user_id, account_type, device_name) => {
    //console.log(user_id);
    //console.log(account_type);
    //console.log(device_name);
    await Account.deleteOne(
        { 'user': user_id, 'account_type': account_type, 'device_name': device_name }).exec();
}

app.intent("Default Welcome Intent", async(conv) => {
    // if (signin.status !== 'OK') {
    //     return conv.ask(new SignIn('To personalize Home Auto, you need to sign in before using the app.'));
    // }

    const userId = conv.user.raw.userId;
    const last_seen = conv.user.last.seen;

    user = await getUser(userId);

    if (user == null) {
        conv.ask('Hello there, this is your first time here.');
        let profile = conv.user.raw.profile;
        if (profile == undefined || profile.email == undefined) {
            conv.ask(new Permission({
                context: 'To use this app',
                permissions: 'EMAIL',
            }));
            return;
        } else {
            // email is available, create the user
            email = profile.email;
            locale = conv.user.raw.locale;
            user = await createUser(userId, email, locale);
        }
    }

    // TODO: update user last seen
    conv.data.user_id = user.id;
    conv.contexts.set('main', 5);
    accounts = await getAccounts(user.id, 'RISCO');
    if (accounts.length === 0) {
        conv.ask('Please proceed to creating a device before continuing. Simply say "set up risco device".');
    } else {
        conv.data.accounts = accounts;
        conv.ask('Hey, how can I help?');
    }
});
  
// Create Dialogflow intent with `actions_intent_PERMISSION` event
app.intent('get_email_permission', async(conv, input, granted) => {
    if (granted) {
        userId = conv.user.raw.userId
        profile = conv.user.raw.profile;
        locale = conv.user.raw.locale;
        if (profile != undefined && profile.email != undefined) {
            // store user in DB
            email = profile.email;
            await createUser(userId, email, locale);
            conv.ask(`Thank you, this is the email I found: ${email}. How can I help?`);
        } else {
            conv.close(`Thank you, but I still could not find your email, bye!`);
        }
    } else {
        // user did not grant permission
        conv.close(`I cannot proceed before getting your email, bye!`);
    }
});

app.intent('what_can_you_do', (conv, params, signin) => {
    return conv.ask('I can operate your Risco home security system.\nTo set up a device say \"set up risco device\".\n\"After the setup, you can say \"arm risco\" or \"arm risco partially"\" or \"disarm risco\". You can delete any set up device by saying \"delete device\" followed by the device name.');
});

app.intent('what_can_you_do_main', (conv, params, signin) => {
    return conv.ask('You can say \"arm risco\" or \"arm risco partially"\" or \"disarm risco\".');
});

app.intent('add_risco_user', (conv, params, signin) => {
    conv.contexts.set('type_risco_username', 1);
    return conv.ask('Great! Let\'s set up a Risco device, what is your Risco username?');
});

app.intent('type_risco_username', (conv, params, signin) => {
    // const context = conv.contexts.get('type_risco_username');
    // const contextParameters = context.parameters;
    // console.log(contextParameters);
    conv.data.risco_username = params.username;
    conv.contexts.set('type_risco_password', 1);
    return conv.ask('Please enter your Risco password.');
});

app.intent('type_risco_password', (conv, params, signin) => {
    conv.data.risco_password = params.password;
    // console.log(conv.data.risco_username);
    // console.log(conv.data.risco_password);
    conv.contexts.set('type_risco_pin', 1);
    return conv.ask('Please enter your Risco pin number.');
});

app.intent('type_risco_pin', (conv, params, signin) => {
    conv.data.risco_pin = params.pin;
    // console.log(conv.data.risco_username);
    // console.log(conv.data.risco_password);
    // console.log(conv.data.risco_pin);
    conv.contexts.set('type_risco_device_name', 1);
    return conv.ask('What would you like to call this device?');
});

app.intent('type_risco_device_name', async(conv, params, signin) => {
    conv.data.risco_device_name = params.device_name;

    const username = conv.data.risco_username;
    const password = conv.data.risco_password;
    const pin = conv.data.risco_pin;
    const device_name = conv.data.risco_device_name;
    
    const additional_data = {pin: pin};
    conv.contexts.set('main', 5);
    await createAccount(conv.data.user_id, 'RISCO', username, password, additional_data, device_name);
    return conv.ask('Great, you now have a Risco device with the name ' + device_name + '.');
});

app.intent('delete_device', async(conv, params, signin) => {
    device_name = params.device_name;
    conv.data.device_name_to_delete = device_name;
    return conv.ask('Are you sure you want to delete the device ' + device_name + '?');
});

app.intent('delete_device - yes', async(conv, params, signin) => {
    device_name = conv.data.device_name_to_delete;
    //console.log("hanlde delete device with name [" + device_name + "]");
    await deleteAccount(conv.data.user_id, 'RISCO', device_name);
    conv.data.device_name_to_delete = null;
    conv.contexts.delete('main');
    return conv.close('OK, the device ' + device_name + ' has been deleted. You\'ll have to set up the device again to use this app.');
});

app.intent('arm_risco_fully', async(conv, input, granted) => {
    accounts = await getAccounts(conv.data.user_id, 'RISCO');
    conv.contexts.set('main', 5);
    if (accounts.length == 0) {
        return conv.ask('Risco device has not yet been set up.');
    } else if (accounts.length > 1) {
        return conv.ask('I can only support a single Risco account at the moment.');
    }
    res = await risco.action(conv, accounts[0], risco.RiscoAction.ARMED);
    if (res === risco.RiscoAction.PARTIALLY_ARMED) {
        conv.ask('Risco device is now partially armed.');
    } else if (res === risco.RiscoAction.DISARMED) {
        conv.ask('Something went wrong, Risco device disarmed.');
    } else if (res === risco.RiscoAction.ARMED) {
        conv.ask('Something went wrong, Risco device still armed.');
    }
});

app.intent('arm_risco_partially', async(conv, input, granted) => {
    accounts = await getAccounts(conv.data.user_id, 'RISCO');
    conv.contexts.set('main', 5);
    if (accounts.length == 0) {
        return conv.ask('Risco device has not yet been set up.');
    } else if (accounts.length > 1) {
        return conv.ask('I can only support a single Risco account at the moment.');
    }
    res = await risco.action(conv, accounts[0], risco.RiscoAction.PARTIALLY_ARMED);
    if (res === risco.RiscoAction.PARTIALLY_ARMED) {
        conv.ask('Risco device is now partially armed.');
    } else if (res === risco.RiscoAction.DISARMED) {
        conv.ask('Something went wrong, Risco device disarmed.');
    } else if (res === risco.RiscoAction.ARMED) {
        conv.ask('Something went wrong, Risco device still armed.');
    }
});

app.intent('disarm_risco', async(conv, input, granted) => {
    accounts = await getAccounts(conv.data.user_id, 'RISCO');
    conv.contexts.set('main', 5);
    if (accounts.length == 0) {
        return conv.ask('Risco device has not yet been set up.');
    } else if (accounts.length > 1) {
        return conv.ask('I can only support a single Risco account at the moment.');
    }
    res = await risco.action(conv, accounts[0], risco.RiscoAction.DISARMED);
    if (res === risco.RiscoAction.DISARMED) {
        conv.ask('Risco device is now disarmed.');
    } else if (res === risco.RiscoAction.ARMED) {
        conv.ask('Something went wrong, Risco device still armed.');
    } else if (res === risco.RiscoAction.PARTIALLY_ARMED) {
        conv.ask('Something went wrong, Risco device still partially armed.');
    } else {
        conv.ask('Something went wrong, Risco state cannot be determined.');
    }
});

exports.index = app;

// exports.index = function(req, res) {

//     console.log(req.body);

//     res.set('Content-Type', 'application/json');
//     res.send({ "speech": "wHATEVER", "displayText": "wHATEVER", "source": "sensei-webhook" })
//     return res;

//     async.parallel({
//         book_count: function (callback) {
//             Book.countDocuments({}, callback);
//         },
//         book_instance_count: function (callback) {
//             BookInstance.countDocuments({}, callback);
//         },
//         book_instance_available_count: function (callback) {
//             BookInstance.countDocuments({status:'Available'}, callback);
//         },
//         author_count: function (callback) {
//             Author.countDocuments({}, callback);
//         },
//         genre_count: function (callback) {
//             Genre.countDocuments({}, callback);
//         },
//     }, function(err, results) {
//         // res.render('index', { title: 'Local Library Home', error: err, data: results })
//         res.send({ title: 'Local Library Home', error: err, data: results })
//     });
// };

