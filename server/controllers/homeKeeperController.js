const User = require('../models/user');
const Account = require('../models/account');
const risco = require('./risco');

const actionOnGoogleClientId = process.env.ACTION_ON_GOOGLE_CLIENT_ID;

const {
    dialogflow,
    Image,
    Carousel,
    BasicCard,
    Button,
    SignIn,
    Confirmation,
} = require("actions-on-google");
  
const app = dialogflow({
    clientId: actionOnGoogleClientId
});

const getUserByEmail = async (email) => {
    return await User.findOne({ 'email': email }).exec();
}

const getUserById = async (id) => {
    return await User.findById(id).exec();
}

const getAccounts = async (user_id, account_type) => {
    // TODO: use account_type correctly, simply adding 'account_type': account_type will not work, though.
    return await Account.find({ user: user_id });
}

getRiscoAccount = async (user_id) => {
    // currently only supporting one Risco device (one account)
    var accounts = await getAccounts(user_id, 'RISCO');
    if (!accounts || accounts.length !== 1) {
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
      title: 'Home Keeper',
      url: 'https://' + process.env.DOMAIN,
    }),
    image: new Image({
      url: 'https://ofekp.dynu.net/home-keeper/static/images/home-keeper_192.png',
      alt: 'Image alternate text',
    }),
    display: 'CROPPED',
});

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
        // conv.data.id will only last for this conversation
        conv.data.id = user.id;
    }

    if (conv.data.id) {
        // conv.user is persistant across conversations
        conv.user.storage.id = conv.data.id;
    }

    var riscoAccount = await getRiscoAccount(conv.user.storage.id);
    if (!riscoAccount) {
        conv.ask(`Thank you for signing in! Please proceed to adding a device at the following link.`);
        conv.close(homeKeeperAppCard);
    } else {
        conv.ask("OK, you're all set up, what would you like to do?");
        conv.ask(risco_operation_carousel);
    }
});

app.intent("Sign Out", async (conv) => {
    conv.user.storage = {}
    conv.close("You are now signed out. You will need to sign in again to use this app.")
})

app.intent("Default Welcome Intent", async (conv) => {
    const {payload} = conv.user.profile;
    const name = payload ? ` ${payload.given_name}` : 'there';
    // conv.user.storage.id contains the id of the record for the user in the DB
    if (conv.user.storage.id) {
        const user = await getUserById(conv.user.storage.id);
        if (!user) {
            return conv.ask(new Confirmation(`You need to sign in again. Would you like to do that?`));
        }

        // the user was found
        console.log(conv.user.storage.id)
        var riscoAccount = await getRiscoAccount(conv.user.storage.id);
        if (!riscoAccount) {
            conv.ask(`You must add a device first, please visit the following link to add a device.`)
            conv.close(homeKeeperAppCard)
            return
        }

        conv.ask(`Hey ${name}, how can I help?`);
        return conv.ask(risco_operation_carousel);
    }

    return conv.ask(new Confirmation(`You need to sign in to use this app. Would you like to do that?`));
});

app.intent('Signin Confirmation', async (conv, params, confirmationGranted) => {
    if (confirmationGranted) {
        const payload = conv.user.profile.payload;

        if (!payload) {
            conv.ask(new SignIn('To personalize'));
            return
        }

        const email = payload.email;
    
        var user = await getUserByEmail(email);
    
        if (!user) {
            // create a new user
            user = await createUser(email, payload.name);
        }
    
        // place the user id in the conversation JSON
        conv.data.id = user.id;
    
        if (conv.data.id) {
            // conv.user is persistant across conversations
            conv.user.storage.id = conv.data.id;
        }

        var riscoAccount = await getRiscoAccount(conv.user.storage.id);
        if (!riscoAccount) {
            conv.ask(`Thank you for signing in! Please proceed to adding a device in the following link.`);
            conv.close(homeKeeperAppCard);
        } else {
            conv.ask("OK, you're all set up, what would you like to do?");
            conv.ask(risco_operation_carousel);
        }
    } else {
        conv.close("OK, bye bye!");
    }
});

app.intent('What Can You Do', async(conv, params, signin) => {
    var riscoAccount = await getRiscoAccount(conv.user.storage.id);
    if (!riscoAccount) {
        conv.ask('I can operate your Risco home security system.\nYou can set up a device using the link below.\n\"After the setup, you can say \"arm risco\" or \"arm risco partially"\" or \"disarm risco\".');
        conv.close(homeKeeperAppCard);
    } else {
        conv.ask('You can say \"arm risco\" or \"arm risco partially\" or \"disarm risco\". Or you can say \"webapp\" to get the link to the web application.');
        conv.ask('What would you like to do?');
        conv.ask(risco_operation_carousel);
    }
});

app.intent('Web App', async(conv, params, signin) => {
    conv.ask('Here\'s the link to the web application, from here you can configure your devices, or delete your account.');
    conv.close(homeKeeperAppCard);
});

async function executeRiscoAction(conv, riscoAccount, action) {
    var res = await risco.action(conv, riscoAccount, action);
    var message = null;
    if (res === risco.RiscoAction.PARTIALLY_ARMED) {
        if (action !== res) {
            message = 'Something went wrong, Risco device is still partially armed.';
        } else {
            message = 'Risco device is now partially armed.';
        }
    } else if (res === risco.RiscoAction.DISARMED) {
        if (action !== res) {
            message = 'Something went wrong, Risco device is still disarmed';
        } else {
            message = 'Risco device is now disarmed.';
        }
    } else if (res === risco.RiscoAction.ARMED) {
        if (action !== res) {
            message = 'Something went wrong, Risco device still armed.';
        } else {
            message = 'Risco device is now armed.';
        }
    } else {
        message = 'Something went wrong, Risco state cannot be determined. Are your Risco account details correct? you can try to set it up again using the link below.';
    }
    return message
}

app.intent('Carousel Selection', async (conv, params, option) => {
    if (!option) {
        return conv.close("Nothing was selection, bye bye!");
    }
    var riscoAccount = await getRiscoAccount(conv.user.storage.id);
    if (!riscoAccount) {
        conv.ask('Risco device has not been set up yet. Please use the link below to set up a device.');
        return conv.close(homeKeeperAppCard);
    }
    var message;
    if (option === "disarm") {
        message = await executeRiscoAction(conv, riscoAccount, risco.RiscoAction.DISARMED);
    } else if (option === "arm_partially") {
        message = await executeRiscoAction(conv, riscoAccount, risco.RiscoAction.PARTIALLY_ARMED);
    } else if (option === "arm_fully") {
        message = await executeRiscoAction(conv, riscoAccount, risco.RiscoAction.ARMED);
    } else {
        message = "You selected an unsupported option.";
    }
    if (message.indexOf("link below") >= 0) {
        conv.ask(message);
        conv.close(homeKeeperAppCard);
    } else {
        conv.close(message);
    }
});

app.intent('Arm Risco Fully', async (conv) => {
    var riscoAccount = await getRiscoAccount(conv.user.storage.id);
    if (!riscoAccount) {
        conv.ask('Risco device has not been set up yet. Please use the link below to set up a device.');
        return conv.close(homeKeeperAppCard);
    }
    const message = await executeRiscoAction(conv, riscoAccount, risco.RiscoAction.ARMED);
    if (message.indexOf("link below") >= 0) {
        conv.ask(message);
        conv.close(homeKeeperAppCard);
    } else {
        conv.close(message);
    }
});

app.intent('Arm Risco Partially', async (conv) => {
    var riscoAccount = await getRiscoAccount(conv.user.storage.id);
    if (!riscoAccount) {
        conv.ask('Risco device has not been set up yet. Please use the link below to set up a device.');
        return conv.close(homeKeeperAppCard);
    }
    const message = await executeRiscoAction(conv, riscoAccount, risco.RiscoAction.PARTIALLY_ARMED);
    if (message.indexOf("link below") >= 0) {
        conv.ask(message);
        conv.close(homeKeeperAppCard);
    } else {
        conv.close(message);
    }
});

app.intent('Disarm Risco', async (conv) => {
    var riscoAccount = await getRiscoAccount(conv.user.storage.id);
    if (!riscoAccount) {
        conv.ask('Risco device has not been set up yet. Please use the link below to set up a device.');
        return conv.close(homeKeeperAppCard);
    }
    const message = await executeRiscoAction(conv, riscoAccount, risco.RiscoAction.DISARMED);
    if (message.indexOf("link below") >= 0) {
        conv.ask(message);
        conv.close(homeKeeperAppCard);
    } else {
        conv.close(message);
    }
});

// const createAccount = async(user_id, account_type, user_name, password, additional_data, device_name) => {

//     // currently only allowing one device of each type
//     //account = await Account.findOne({ 'user': user.id, 'account_type': account_type }).exec();
//     //console.log(account);

//     // if (account === undefined) {
//     //     account = new Account();
//     // } else {
//     //     account
//     // }

//     // console.log("==>");
//     // console.log(user_id);
//     // console.log(account_type);
//     // console.log(user_name);
//     // console.log(password);
//     // console.log(additional_data);
//     // console.log(device_name);

//     await Account.updateOne( 
//         { 'user': user_id, 'account_type': account_type },
//         {
//             user: user_id,
//             account_type: account_type,
//             user_name: user_name,
//             password: password,
//             additional_data: JSON.stringify(additional_data),
//             device_name: device_name.toLowerCase(),
//         },
//         { upsert : true }).exec();

//     // await account.save(function(err) {
//     //     if (err) {
//     //         console.log(err);
//     //         return err; 
//     //     }
//     //     // success
//     //     return;
//     // });
// }

// const deleteAccount = async(user_id, account_type, device_name) => {
//     await Account.deleteOne(
//         { 'user': user_id, 'account_type': account_type, 'device_name': device_name.toLowerCase() }).exec();
// }

// app.intent('add_device', (conv, params, signin) => {
//     if (params.device_type.toLowerCase() !== 'risco') {
//         return conv.ask('I can only support Risco home security system currently. What would you like to do then?');
//     }
//     conv.ask('Great! Let\'s set up a Risco device, what is your Risco username?');
// });

// app.intent('type_risco_username', (conv, params, signin) => {
//     // const context = conv.contexts.get('type_risco_username');
//     // const contextParameters = context.parameters;
//     // console.log(contextParameters);
//     conv.data.risco_username = params.username;
//     return conv.ask('Please enter your Risco password.');
// });

// app.intent('type_risco_password', (conv, params, signin) => {
//     conv.data.risco_password = params.password;
//     // console.log(conv.data.risco_username);
//     // console.log(conv.data.risco_password);
//     return conv.ask('Please enter your Risco pin number.');
// });

// app.intent('type_risco_pin', (conv, params, signin) => {
//     conv.data.risco_pin = params.pin;
//     // console.log(conv.data.risco_username);
//     // console.log(conv.data.risco_password);
//     // console.log(conv.data.risco_pin);
//     return conv.ask('What would you like to call this device?');
// });

// app.intent('type_risco_device_name', async(conv, params, signin) => {
//     conv.data.risco_device_name = params.device_name;

//     const username = conv.data.risco_username;
//     const password = conv.data.risco_password;
//     const pin = conv.data.risco_pin;
//     const device_name = conv.data.risco_device_name;
    
//     const additional_data = {pin: pin};
//     await createAccount(conv.data.user_id, 'RISCO', username, password, additional_data, device_name);
//     conv.data.risco_username = null;
//     conv.data.risco_password = null;
//     conv.data.risco_pin = null;
//     conv.data.risco_device_name = null;
//     conv.ask('Great, you now have a Risco device with the name ' + device_name + '. You can now operate Risco by saying \"arm risco\" or \"arm risco partially\" or \"disarm risco\".');
//     //conv.ask(risco_operation_carousel);
// });

// app.intent('delete_device', async(conv, params, signin) => {
//     device_name = params.device_name;
//     conv.data.device_name_to_delete = device_name;
//     conv.ask('Are you sure you want to delete the device ' + device_name + '?');
// });

// app.intent('delete_device - yes', async(conv, params, signin) => {
//     device_name = conv.data.device_name_to_delete;
//     //console.log("hanlde delete device with name [" + device_name + "]");
//     await deleteAccount(conv.data.user_id, 'RISCO', device_name);
//     conv.data.device_name_to_delete = null;
//     conv.close('OK, the device ' + device_name + ' has been deleted. You\'ll have to set up the device again to use this app.');
// });

// app.intent('delete_device - no', async(conv, params, signin) => {
//     device_name = conv.data.device_name_to_delete;
//     //console.log("hanlde delete device with name [" + device_name + "]");
//     conv.data.device_name_to_delete = null;
//     conv.ask('Canceled device deletion, how can I help then?');
// });

exports.index = app;