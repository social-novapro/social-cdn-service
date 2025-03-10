function reqToHeaders(req) {
    const headers = {
        userID: req.headers.userid ?? null,
        userToken: req.headers.usertoken ?? null,
        accessToken: req.headers.accesstoken ?? null,
        appToken: req.headers.apptoken ?? null,
        devToken: req.headers.devtoken ?? null
    }

    return headers;
}

module.exports = {reqToHeaders};