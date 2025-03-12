const { minioClient } = require("../minio");

function getFile(fileID, headers, bucket = 'interact', res) {
    minioClient.getObject(bucket, fileID, (err, dataStream) => {
        if (err) {
            return reject({ error: err });
        }

        let data = [];
        dataStream.on('data', (chunk) => {
            data.push(chunk);
        });

        dataStream.on('end', () => {
            const fileBuffer = Buffer.concat(data);
            resolve({ success: true, file: fileBuffer });
            return res.send(fileBuffer);
        });

        dataStream.on('error', (err) => {
            return res.send({ error: err });
        });
    });
}

/*
const { minioClient } = require("../minio");

async function getFile(fileID, headers) {
    const file = await minioClient.getObject('interact', fileID);

    return {success: true, file};
}

module.exports = {getFile};*/
module.exports = { getFile };