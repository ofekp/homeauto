import axios from 'axios';

axios.defaults.validateStatus = function () {
    return true;
};

export const getUserDetails = async (email) => {
    const response = await axios.post('home-auto/user/detail', { "email": email }, {});
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}

export const createUser = async (email, name) => {
    const response = await axios.post('home-auto/user/create', { "email": email, "name": name }, {});
    if (response.status !== 200) {
        return null;
    }
    const body = await response["data"];
    return body;
}