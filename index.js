var Minio = require('minio')
const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()

var minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: true,
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY
});

runtest();

function runtest() {
    var file = './ex/v16.png';
    console.log(file)
    minioClient.fPutObject("");

}


app.get('/', (req, res) => res.sendFile('./home/index.html', { root: __dirname }));
app.get('/script.js', (req, res) => res.sendFile('./home/script.js', { root: __dirname }));
app.post('/fileupload', (req, res) => {
    console.log(req.body);
    // req.
    // minioClient.fPutObject("");
    // minioClient.listBuckets(function(err, buckets) {
    //     if (err) return console.log(err)
    //     console.log('buckets :', buckets)
    //     res.send(buckets)
    // })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))