var Minio = require('minio')
const {v4: UUIDv4} = require('uuid');
const {verifyFile} = require('./verifyFile');
const { minioClient } = require('../minio');

async function uploadFile(file, headers) {
    const fileBuffer = file.buffer;
    const originalFilename = file.originalname;
    const uuid = UUIDv4();

    const extension = originalFilename.split('.').pop();

    console.log(originalFilename)
    console.log(extension)
    const verified = verifyFile(fileBuffer, extension);
    if (verified.error) return verified;

    const newFileName = uuid + "." + extension;
    return new Promise((resolve, reject) => {
        minioClient.putObject('interact', newFileName, fileBuffer, async (err, etag) => {
            if (err) {
                reject({error: err});
            }

            resolve({ success: true, fileID: newFileName});
        });
    });
}

module.exports = {uploadFile};