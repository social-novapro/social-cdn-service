function reqToHeaders(reqHeaders) {
    const headers = {
        userID: reqHeaders.userid ?? null,
        userToken: reqHeaders.usertoken ?? null,
        accessToken: reqHeaders.accesstoken ?? null,
        appToken: reqHeaders.apptoken ?? null,
        devToken: reqHeaders.devtoken ?? null
    }

    return headers;
}

module.exports = {reqToHeaders};