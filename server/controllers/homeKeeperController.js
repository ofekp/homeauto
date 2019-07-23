const User = require('../models/user');
const Account = require('../models/account');
const risco = require('./risco');

const async = require('async');
const axios = require('axios');
const querystring = require('querystring');

const actionOnGoogleClientId = process.env.ACTION_ON_GOOGLE_CLIENT_ID;

const {
    dialogflow,
    Image,
    Carousel,
    BasicCard,
    Button,
    SignIn,
    Permission,
    UnauthorizedError
} = require("actions-on-google");
  
const app = dialogflow({
    clientId: actionOnGoogleClientId
});

const getUserByEmail = async(email) => {
    return await User.findOne({ 'email': email }).exec();
}

const getUserById = async(id) => {
    return await User.findOne({ 'user': id }).exec();
}

const getAccounts = async(user_id, account_type) => {
    return await Account.find({ 'user': user_id, 'account_type': account_type }).exec();
}

getRiscoAccount = async(user_id) => {
    // currently only supporting one Risco device (one account)
    var accounts = await getAccounts(user_id, 'RISCO');
    if (accounts.length != 1) {
        return null;
    }
    return accounts[0];
}

const createUser = async(email, name) => {

    return await User.updateOne( 
        { 'email': email, 'name': name },
        {
            email: email,
            name: name,
        },
        { upsert : true }).exec();
}

risco_operation_carousel = new Carousel({
    items: {
      disarm: {
        title: 'Disarm Risco',
        description: 'Disarm Risco',
      },
      arm_partially: {
        title: 'Arm Risco',
        description: 'Arm Risco',
      },
      arm_fully: {
        title: 'Arm Risco partially',
        description: 'Arm Risco only in selected areas',
      }
    }
})

homeKeeperAppCard = new BasicCard({
    // Note the two spaces before '\n' required for a line break to be rendered in the card.
    text: `To use this app you will need to add a Risco device. Follow the link below to create a device.`, 
    subtitle: 'Home Keeper',
    title: 'Home Keeper App',
    buttons: new Button({
      title: 'Home Keeper - ',
      url: 'https://' + process.env.DOMAIN,
    }),
    image: new Image({
      url: 'https://example.com/image.png',
      alt: 'Image alternate text',
    }),
    display: 'CROPPED',
  });

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
        { 'user': user_id, 'account_type': account_type },
        {
            user: user_id,
            account_type: account_type,
            user_name: user_name,
            password: password,
            additional_data: JSON.stringify(additional_data),
            device_name: device_name.toLowerCase(),
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
        { 'user': user_id, 'account_type': account_type, 'device_name': device_name.toLowerCase() }).exec();
}

// Intent that starts the account linking flow.
app.intent('Start Sign In', (conv) => {
    conv.ask(new SignIn('To personalize'));
});

app.intent('Get Signin', async (conv, params, signin) => {
    if (signin.status !== 'OK') {
        return conv.close('Let\'s try again next time.');
    }

    const payload = conv.user.profile.payload;
    const email = payload.email;

    if (!conv.data.id && email) {
        var user = await getUserByEmail(email);

        if (!user) {
            // create a new user
            user = await createUser(email, payload.name);
        }

        // place the user id in the conversation JSON
        conv.data.id = user.id;
    }

    if (conv.data.id) {
        // conv.user is persistant across conversations
        conv.user.storage.id = conv.data.id;
    }

    conv.ask(homeKeeperAppCard);
    conv.close(`Thank you for signing in! Please proceed to adding a device at https://ofekp.dynu.net then you will be able to control it from this voice app.`);
});

app.intent("Default Welcome Intent", async (conv) => {
    console.log("Default Welcome Intent");
    console.log(conv.user.profile);

    const {payload} = conv.user.profile;
    const name = payload ? ` ${payload.given_name}` : 'there';
    // conv.user.storage.id contains the id of the record for the user in the DB
    if (conv.user.storage.id) {
        const user = await getUserById(conv.user.id);
        if (!user) {
            return conv.ask(`There seems to be a problem with your account. Please try sigining in again.`);
        }

        // the user was found
        var riscoAccount = getRiscoAccount(conv.user.id)
        if (!riscoAccount) {
            conv.ask(homeKeeperAppCard);
            return conv.close(`You must add a device first, please visit https://ofekp.dynu.net to add a device.`);
        }

        return conv.ask(`Hey ${name}, how can I help?`);
    }

    return conv.close(`You must sign in first. For that you'll need to say \"I want to sign in\".`);
});

app.intent('what_can_you_do', async(conv, params, signin) => {
    var riscoAccount = await getRiscoAccount(conv.data.user_id);
    if (riscoAccount == null) {
        conv.ask('I can operate your Risco home security system.\nTo set up a device say \"set up risco device\".\n\"After the setup, you can say \"arm risco\" or \"arm risco partially"\" or \"disarm risco\". You can delete any set up device by saying \"delete device\" followed by the device name.');
        conv.ask('What would you like to do?');
        // conv.ask(new Carousel({
        //     items: {
        //       add_risco_device: {
        //         title: 'Set up Risco device',
        //         description: 'Set up a new Risco device',
        //       },
        //     }
        // }));
    } else {
        conv.ask('You can say \"arm risco\" or \"arm risco partially\" or \"disarm risco\".');
        conv.ask('What would you like to do?');
        // conv.ask(risco_operation_carousel);
    }
});

app.intent('add_device', (conv, params, signin) => {
    if (params.device_type.toLowerCase() !== 'risco') {
        return conv.ask('I can only support Risco home security system currently. What would you like to do then?');
    }
    conv.ask('Great! Let\'s set up a Risco device, what is your Risco username?');
});

app.intent('type_risco_username', (conv, params, signin) => {
    // const context = conv.contexts.get('type_risco_username');
    // const contextParameters = context.parameters;
    // console.log(contextParameters);
    conv.data.risco_username = params.username;
    return conv.ask('Please enter your Risco password.');
});

app.intent('type_risco_password', (conv, params, signin) => {
    conv.data.risco_password = params.password;
    // console.log(conv.data.risco_username);
    // console.log(conv.data.risco_password);
    return conv.ask('Please enter your Risco pin number.');
});

app.intent('type_risco_pin', (conv, params, signin) => {
    conv.data.risco_pin = params.pin;
    // console.log(conv.data.risco_username);
    // console.log(conv.data.risco_password);
    // console.log(conv.data.risco_pin);
    return conv.ask('What would you like to call this device?');
});

app.intent('type_risco_device_name', async(conv, params, signin) => {
    conv.data.risco_device_name = params.device_name;

    const username = conv.data.risco_username;
    const password = conv.data.risco_password;
    const pin = conv.data.risco_pin;
    const device_name = conv.data.risco_device_name;
    
    const additional_data = {pin: pin};
    await createAccount(conv.data.user_id, 'RISCO', username, password, additional_data, device_name);
    conv.data.risco_username = null;
    conv.data.risco_password = null;
    conv.data.risco_pin = null;
    conv.data.risco_device_name = null;
    conv.ask('Great, you now have a Risco device with the name ' + device_name + '. You can now operate Risco by saying \"arm risco\" or \"arm risco partially\" or \"disarm risco\".');
    //conv.ask(risco_operation_carousel);
});

app.intent('delete_device', async(conv, params, signin) => {
    device_name = params.device_name;
    conv.data.device_name_to_delete = device_name;
    conv.ask('Are you sure you want to delete the device ' + device_name + '?');
});

app.intent('delete_device - yes', async(conv, params, signin) => {
    device_name = conv.data.device_name_to_delete;
    //console.log("hanlde delete device with name [" + device_name + "]");
    await deleteAccount(conv.data.user_id, 'RISCO', device_name);
    conv.data.device_name_to_delete = null;
    conv.close('OK, the device ' + device_name + ' has been deleted. You\'ll have to set up the device again to use this app.');
});

app.intent('delete_device - no', async(conv, params, signin) => {
    device_name = conv.data.device_name_to_delete;
    //console.log("hanlde delete device with name [" + device_name + "]");
    conv.data.device_name_to_delete = null;
    conv.ask('Canceled device deletion, how can I help then?');
});

app.intent('arm_risco_fully', async(conv, input, granted) => {
    var riscoAccount = await getRiscoAccount(conv.data.user_id);
    if (riscoAccount == null) {
        return conv.ask('Risco device has not yet been set up yet. Please say "set up risco device" to begin the setup.');
    }
    var res = await risco.action(conv, riscoAccount, risco.RiscoAction.ARMED);
    var message = null;
    if (res === risco.RiscoAction.PARTIALLY_ARMED) {
        message = 'Risco device is now partially armed.';
    } else if (res === risco.RiscoAction.DISARMED) {
        message = 'Something went wrong, Risco device disarmed.';
    } else if (res === risco.RiscoAction.ARMED) {
        message = 'Something went wrong, Risco device still armed.';
    } else {
        message = 'Something went wrong, Risco state cannot be determined. Are your Risco account details correct? you can try to set it up again by saying "set up risco device".';
    }

    conv.ask(message);
});

app.intent('arm_risco_partially', async(conv, input, granted) => {
    var riscoAccount = await getRiscoAccount(conv.data.user_id);
    if (riscoAccount == null) {
        return conv.ask('Risco device has not yet been set up yet. Please say "set up risco device" to begin the setup.');
    }
    res = await risco.action(conv, riscoAccount, risco.RiscoAction.PARTIALLY_ARMED);
    if (res === risco.RiscoAction.PARTIALLY_ARMED) {
        message = 'Risco device is now partially armed.';
    } else if (res === risco.RiscoAction.DISARMED) {
        message = 'Something went wrong, Risco device disarmed.';
    } else if (res === risco.RiscoAction.ARMED) {
        message = 'Something went wrong, Risco device still armed.';
    } else {
        message = 'Something went wrong, Risco state cannot be determined. Are your Risco account details correct? you can try to set it up again by saying "set up risco device".';
    }

    conv.ask(message);
});

app.intent('disarm_risco', async(conv, input, granted) => {
    var riscoAccount = await getRiscoAccount(conv.data.user_id);
    if (riscoAccount == null) {
        return conv.ask('Risco device has not yet been set up yet. Please say "set up risco device" to begin the setup.');
    }
    res = await risco.action(conv, riscoAccount, risco.RiscoAction.DISARMED);
    if (res === risco.RiscoAction.DISARMED) {
        message = 'Risco device is now disarmed.';
    } else if (res === risco.RiscoAction.ARMED) {
        message = 'Something went wrong, Risco device still armed.';
    } else if (res === risco.RiscoAction.PARTIALLY_ARMED) {
        message = 'Something went wrong, Risco device still partially armed.';
    } else {
        message = 'Something went wrong, Risco state cannot be determined. Are your Risco account details correct? you can try to set it up again by saying "set up risco device".';
    }

    conv.ask(message);
});

exports.index = app;