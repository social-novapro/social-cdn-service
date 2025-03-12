const { v4: UUIDv4 } = require('uuid');
const sharp = require('sharp');
const { verifyFile } = require('./verifyFile');
const { minioClient } = require('../minio');

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

        await minioClient.putObject('interact-images', newFileName, resizedBuffer, resizedBuffer.length);
        res.send({ success: true, fileID: newFileName });
    } catch (err) {
        res.status(500).send({ error: err.message || 'Error processing image' });
    }
}

module.exports = { uploadImage };