const { minioClient } = require("../../minio");
const fs = require('fs');

async function uploadVideoToMinio(filePath, fileName) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath);
        fs.stat(filePath, (err, stats) => {
            if (err) return reject(err);

            minioClient.putObject('interact-videos', fileName, fileStream, stats.size, (err, etag) => {
                fs.unlink(filePath, () => {}); // Delete temp file
                if (err) return reject(err);
                resolve(etag);
            });
        });
    });
}

module.exports = { uploadVideoToMinio };