import axios from 'axios';

axios.defaults.validateStatus = function () {
    return true;
};

export const getCookie = async (token_id) => {

    const response = await axios.post('home-keeper/login', null, { headers: { 'token-id': token_id } });
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}

export const revokeCookie = async () => {
    const response = await axios.post('home-keeper/login/revoke', null, {});
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}

export const getUserDetails = async (email) => {
    const response = await axios.post('home-keeper/user/detail', { "email": email }, {});
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}

export const createUser = async (email, name) => {
    const response = await axios.post('home-keeper/user/create', { "email": email, "name": name }, {});
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}

export const deleteUser = async (email) => {
    const response = await axios.post('home-keeper/user/delete', { "email": email }, {});
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}

export const getRiscoState = async (email, device_name) => {
    const response = await axios.post('home-keeper/device/getState', { "email": email, "device_name": device_name }, {});
    console.log("status: " + response.status);
    if (response.status !== 200) {
        console.log("here1")
        return null;
    }
    const body = await response["data"];
    return body;
}