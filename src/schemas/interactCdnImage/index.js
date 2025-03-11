const mongoose = require('mongoose');
const { reqBool, reqNum, reqString } = require('../types');

const interactCdnImage = mongoose.Schema({
    _id: reqString,  // UUID
    timestamp: reqNum,
    userID: reqString,

    baseUrl: reqString,
    fileName: reqString,
    fileExtension: reqString,
    fileSizeX: reqNum,
    fileSizeY: reqNum,
});

module.exports = mongoose.model('interact-cdn-image', interactCdnImage);