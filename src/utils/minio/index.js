const Minio = require('minio')
require('dotenv').config();

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY
});

module.exports = {minioClient};