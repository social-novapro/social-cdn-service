const { minioClient } = require("../../minio");
const fs = require('fs');

function uploadVideoToMinio(filePath, fileName, res) {
    const fileStream = fs.createReadStream(filePath);
    fs.stat(filePath, (err, stats) => {
        if (err) return reject(err);

        minioClient.putObject('interact-videos', fileName, fileStream, stats.size, (err, etag) => {
            fs.unlink(filePath, () => {}); // Delete temp file
            if (err) return reject(err);
            res.send({ success: true, fileID: fileName });

        });
    });
}

module.exports = { uploadVideoToMinio };