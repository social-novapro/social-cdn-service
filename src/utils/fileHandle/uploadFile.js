const {v4: UUIDv4} = require('uuid');
const {verifyFile} = require('./verifyFile');
const { minioClient } = require('../minio');
const sharp = require('sharp');

function uploadImage(file, headers, res) {
    const fileBuffer = file.buffer;
    const originalFilename = file.originalname;
    const uuid = UUIDv4();

    const extension = originalFilename.split('.').pop();

    const verified = verifyFile(fileBuffer, extension);
    if (verified.error) return verified;

    const newFileName = uuid + "." + extension;
    
    // const newSize 

    sharp(fileBuffer)
        .resize({ width: 1920, height: 1080, fit: 'inside' }) // Fit within 1080p
        .toBuffer((err, resizedBuffer) => {
            if (err) {
                return res.status(500).send({ error: 'Error processing image' });
            }

            const newFileName = `${uuid}.${extension}`;

            // Upload to Minio
            minioClient.putObject('interact-images', newFileName, resizedBuffer, resizedBuffer.length, (err, etag) => {
                if (err) {
                    return res.status(500).send({ error: err });
                }
                res.send({ success: true, fileID: newFileName });
            });
        });

    // minioClient.putObject('interact-images', newFileName, fileBuffer, (err, etag) => {
    //     if (err) {
    //         res.send(err);
    //         reject({error: err});
    //     }

    //     res.send({success: true, fileID: newFileName});
    //     // resolve({ success: true, fileID: newFileName});
    // });
    // });
}

module.exports = {uploadImage};