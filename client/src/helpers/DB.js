
exports.getUserDetails = async (email) => {
    const response = await axios.post('home-auto/user/detail', { "email": email }, {});
    const body = await response["data"];
    if (response.status !== 200) throw Error(body.message);
    return body;
}