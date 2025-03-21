const { v4: UUIDv4 } = require('uuid');
const sharp = require('sharp');
const { verifyFile } = require('./verifyFile');
const { minioClient } = require('../minio');
const { saveFileData } = require('../saveMongo');
const imageInteractBucket = "interact-images";

async function uploadImage(file, headers, res, sizeX=1920, sizeY=1080, bucketName=imageInteractBucket) {
    const fileBuffer = file.buffer;
    const originalFilename = file.originalname;
    const uuid = UUIDv4();

    const extension = originalFilename.split('.').pop();

    const verified = verifyFile(originalFilename, "image");
    if (verified.error) return verified;

    const newFileName = uuid + "." + extension;

    try {
        const resizedBuffer = await sharp(fileBuffer)
            .resize({ width: sizeX, height: sizeY, fit: 'inside' }) // Fit within 1080p
            .toBuffer();

        await minioClient.putObject(bucketName, newFileName, resizedBuffer, resizedBuffer.length);

        // save thumbnail
        let createdThumbnail;
        if (bucketName != "thumbnail") {
            createdThumbnail = await uploadImage(file, headers, res, 512, 360, "thumbnail");
        }

        await saveFileData({
            fileID: uuid,
            userID: headers.userID,
            fileName: newFileName,
            originalFilename,
            fileExtension: extension,
            fileType: "image",
            interactCdnURL: `/static/${newFileName}`,
            interactCdnBucket: bucketName,
            thumbnailURL: createdThumbnail ? createdThumbnail.cdnURL : null
        });

        if (bucketName != "thumbnail" ) return res.send({ success: true, fileID: newFileName, cdnURL: `/static/${newFileName}`, thumbnailURL: createdThumbnail ? createdThumbnail.cdnURL : null });
        else return { success: true, fileID: newFileName, cdnURL: `/static/${newFileName}` };
    } catch (err) {
        console.log("Error uploading image:", err);

        if (bucketName != "thumbnail" ) return res.status(500).send({ error: "Error uploading image, please try again later." });
        else return { error: "Error uploading image, please try again later." };
    }
}

module.exports = { uploadImage };