const interactCdnFile = require("../schemas/interactCdnFile");

async function getFileInfo(headers, fileID, full=false) {
    if (!fileID) return { status: 400, error: true, message: 'No fileID provided' };
    
    const fileIDF = fileID.split('.')[0];
    if (!headers) return { status: 403, error: true, message: 'No headers provided' };
    if (!fileIDF) return { status: 400, error: true, message: 'No fileID found' };

    const foundFile = await interactCdnFile.findOne({ _id: fileIDF });
    if (!foundFile) {
        return { status: 404, error: true, message: 'File not found' };
    }

    if (full) {
        return foundFile;
    } else {
        // increase views
        foundFile.views ? foundFile.views += 1 : foundFile.views = 1;
        await foundFile.save();
    }
    
    return {
        _id: foundFile._id,
        timestamp: foundFile.timestamp,
        extension: foundFile.extension,
        type: foundFile.type,
        cdnURL: foundFile.cdnURL,
        thumbnailURL: foundFile.thumbnailURL ? foundFile.thumbnailURL : null,
        views: foundFile.views ?? 0,
    }
}

module.exports = { getFileInfo };