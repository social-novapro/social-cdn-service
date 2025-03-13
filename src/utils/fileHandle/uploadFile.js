const { v4: UUIDv4 } = require('uuid');
const sharp = require('sharp');
const { verifyFile } = require('./verifyFile');
const { minioClient } = require('../minio');
const { saveFileData } = require('../saveMongo');
const imageInteractBucket = "interact-images";

async function uploadImage(file, headers, res) {
    const fileBuffer = file.buffer;
    const originalFilename = file.originalname;
    const uuid = UUIDv4();

    const extension = originalFilename.split('.').pop();

    const verified = verifyFile(originalFilename, "image");
    if (verified.error) return verified;

    const newFileName = uuid + "." + extension;

    try {
        const resizedBuffer = await sharp(fileBuffer)
            .resize({ width: 1920, height: 1080, fit: 'inside' }) // Fit within 1080p
            .toBuffer();

        await minioClient.putObject(imageInteractBucket, newFileName, resizedBuffer, resizedBuffer.length);
        await saveFileData({
            fileID: uuid,
            userID: headers.userID,
            fileName: newFileName,
            originalFilename,
            fileExtension: extension,
            fileType: "image",
            interactCdnURL: `/static/${newFileName}`,
            interactCdnBucket: imageInteractBucket
        });

        res.send({ success: true, fileID: newFileName, cdnURL: `/static/${newFileName}` });
    } catch (err) {
        console.log("Error uploading image:", err);

        res.status(500).send({ error: "Error uploading image, please try again later." });
    }
}

module.exports = { uploadImage };