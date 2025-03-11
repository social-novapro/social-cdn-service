const { v4: UUIDv4 } = require('uuid');
const { verifyFile } = require('./verifyFile');

function fileDataUtil(file) {
    const verified = verifyFile(file, file.originalname.split('.').pop());
    if (!verified) {
        return { error: true };
    }
    return {
        allowed: true,
        uuid: UUIDv4(),
        originalFilename: file.originalname,
        extension: file.originalname.split('.').pop()
    }
}

module.exports = { fileDataUtil };