const { minioClient } = require("../minio");

async function getFile(fileID, headers, bucket = 'interact', res) {
    res.setHeader('Content-Type', mime.lookup(fileID) || 'application/octet-stream');

    try {
        const dataStream = await minioClient.getObject(bucket, fileID);
        let data = [];

        dataStream.on('data', (chunk) => {
            data.push(chunk);
        });

        dataStream.on('end', () => {
            const fileBuffer = Buffer.concat(data);
            res.send(fileBuffer);
        });

        dataStream.on('error', (err) => {
            res.send({ error: err });
        });
    } catch (err) {
        res.send({ error: err });
    }
}

module.exports = { getFile };