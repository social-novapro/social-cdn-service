const {v4: UUIDv4} = require('uuid');
const {verifyFile} = require('./verifyFile');
const { minioClient } = require('../minio');

function uploadFile(file, headers, res) {
    const fileBuffer = file.buffer;
    const originalFilename = file.originalname;
    const uuid = UUIDv4();

    const extension = originalFilename.split('.').pop();

    const verified = verifyFile(fileBuffer, extension);
    if (verified.error) return verified;

    const newFileName = uuid + "." + extension;
    
    minioClient.putObject('interact', newFileName, fileBuffer, (err, etag) => {
        if (err) {
            res.send(err);
            reject({error: err});
        }

        res.send({success: true, fileID: newFileName});
        // resolve({ success: true, fileID: newFileName});
    });
    // });
}

module.exports = {uploadFile};