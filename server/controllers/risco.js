const async = require('async');
const axios = require('axios');
const querystring = require('querystring');

// axios.interceptors.request.use(request => {
//   console.log('Starting Request', request)
//   return request
// })

// // axios.interceptors.response.use(response => {
// //   console.log('Response:', response)
// //   return response
// // })

exports.RiscoAction = Object.freeze({
    ARMED: 1,
    PARTIALLY_ARMED: 2,
    DISARMED: 3,
});


// https://github.com/axios/axios/issues/980
exports.login = async(account) => {
    try {
        var body_params = {
            username: account.user_name,
            password: account.password,
            RememberMe: false,
            strRedirectToEventUID: '',
            strRedirectToSiteId: '',
        }
    
        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    
        options = {
            headers: headers,
            maxRedirects: 0,
            validateStatus: function (status) {
                return status === 302; // default
            },
        }
        
        const response = await axios.post('https://www.riscocloud.com/ELAS/WebUI/', querystring.stringify(body_params), options);
        const body = await response["data"];
        if (response.status !== 302) {
            return null;
        }

        set_cookie_str = response.headers['set-cookie'][0];
        asp_session_id = set_cookie_str.substring(set_cookie_str.indexOf("ASP.NET_SessionId") + 18, set_cookie_str.indexOf(';'));

        var headers2 = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': response.headers['set-cookie'][0],
        }

        var location = response.headers['location'];
        var response2 = await axios.post('https://www.riscocloud.com' + location, querystring.stringify(body_params), {headers: headers2});
        const body2 = await response2["data"];
        if (response2.status !== 200) {
            return null;
        }

        // extract site id
        var selectedSiteId = body2.match(/\<input checked=\"checked\".*value=\"(?<selectedSiteId>[0-9]+)\".*\/>/).groups.selectedSiteId;
        body_str = "SelectedSiteId=" + selectedSiteId + "&Pin=" + JSON.parse(account.additional_data).pin
        RUCCookie = 'username=' + account.user_name + '&langId=en&isForcedLangId=False';
        cookie_str = 'RUCCookie=' + RUCCookie + '; ASP.NET_SessionId=' + asp_session_id

        var headers3 = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://www.riscocloud.com',
            'Host': 'www.riscocloud.com',
            'Referer': 'https://www.riscocloud.com/ELAS/WebUI/MainPage/MainPage',
            'Accept': '*/*',
            'Cookie': cookie_str,
        }

        var response3 = await axios.post('https://www.riscocloud.com/ELAS/WebUI/SiteLogin', body_str, {headers: headers3});
        var body3 = await response3["data"];
        if (response3.status !== 200) {
            //console.log(body3.message);
            return null;
        }

        return cookie_str;
    } catch(error) {
        //console.log(error);
    }

    return null;
}

exports.action = async(conv, account, riscoAction) => {

    switch (riscoAction) {
        case this.RiscoAction.ARMED:
            riscoAction = "armed";
            break;
        case this.RiscoAction.PARTIALLY_ARMED:
            riscoAction = "partially";
            break;
        case this.RiscoAction.DISARMED:
            riscoAction = "disarmed";
            break;
        default:
            return null;
    }

    // try to see if the current conversation already has a cookie
    var cookie_str = null;
    if (conv.data.risco_cookie !== undefined) {
        cookie_str = conv.data.risco_cookie;
    } else {
        cookie_str = await this.login(account);
        if (cookie_str == null) {
            return null;
        }
        conv.data.risco_cookie = cookie_str;
    }

    body_str = "type=0%3A" + riscoAction + "&passcode=------&bypassZoneId=-1";

    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://www.riscocloud.com',
        'Host': 'www.riscocloud.com',
        'Referer': 'https://www.riscocloud.com/ELAS/WebUI/MainPage/MainPage',
        'Accept': '*/*',
        'Cookie': cookie_str,
    }

    var response = await axios.post('https://www.riscocloud.com/ELAS/WebUI/Security/ArmDisarm', body_str, {headers: headers})
    var body = await response["data"];
    if (response.status !== 200) return response.status;

    armIcon = body.detectors.parts[0].armIcon;

    if (armIcon.indexOf("ico-partial.png") !== -1) {
        return this.RiscoAction.PARTIALLY_ARMED;
    } else if (armIcon.indexOf("ico-armed.png") !== -1) {
        return this.RiscoAction.ARMED;
    } else if (armIcon.indexOf("ico-disarmed.png") !== -1) {
        return this.RiscoAction.DISARMED;
    } else {
        return null;
    }
}