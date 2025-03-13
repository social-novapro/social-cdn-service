const mongoose = require('mongoose');
const { reqBool, reqNum, reqString } = require('../types');

const interactCdnFile = mongoose.Schema({
    _id: reqString,  // UUID
    timestamp: reqNum,
    userID: reqString,
    name: reqString,
    originalName: reqString,
    extension: reqString,
    type: reqString,
    cdnURL: reqString,
    cdnBucket: reqString
});

module.exports = mongoose.model('interact-cdn-file', interactCdnFile);