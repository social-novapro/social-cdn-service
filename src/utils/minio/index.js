const Minio = require('minio')
require('dotenv').config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIOAPI_URL,
    port: 9000,
    useSSL: false,
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY
});

module.exports = {minioClient};