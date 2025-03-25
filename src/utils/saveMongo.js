const interactCdnFile = require("../schemas/interactCdnFile");
const { checktime } = require("./checktime");

async function saveFileData({
    fileID,
    userID,
    fileName,
    originalFilename,
    fileExtension,
    fileType,
    interactCdnURL,
    interactCdnBucket,
    thumbnailURL,
}) {
    const saveFile = await interactCdnFile.create({
        _id: fileID,
        timestamp: checktime(),
        userID: userID,
        name: fileName,
        originalName: originalFilename,
        extension: fileExtension,
        type: fileType,
        cdnURL: interactCdnURL,
        cdnBucket: interactCdnBucket,
        thumbnailURL: thumbnailURL || null,
        isThumbnail: thumbnailURL ? true : false,
        views: 0,
    });

    return saveFile;
}

module.exports = { saveFileData };