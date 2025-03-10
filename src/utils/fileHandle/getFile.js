const { minioClient } = require("../minio");

async function getFile(fileID, headers) {
    return new Promise((resolve, reject) => {
        minioClient.getObject('interact', fileID, (err, dataStream) => {
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
            });

            dataStream.on('error', (err) => {
                reject({ error: err });
            });
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