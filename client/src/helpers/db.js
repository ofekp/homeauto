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

export const revokeAllCookies = async () => {
    const response = await axios.post('home-keeper/login/revoke-all', null, {});
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}

export const getUserDetails = async () => {
    const response = await axios.post('home-keeper/user/detail', null, {})
    return response
}

export const createUser = async (email, name) => {
    const response = await axios.post('home-keeper/user/create', { "email": email, "name": name }, {});
    return response
}

export const deleteUser = async () => {
    const response = await axios.post('home-keeper/user/delete', null, {});
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}