var Minio = require('minio')
const express = require('express')
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = 3000;
require('dotenv').config();

var minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY
});

app.use(cors());
// app.use(cors({
//     origin: '*'
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => res.sendFile('./home/index.html', { root: __dirname }));
app.get('/script.js', (req, res) => res.sendFile('./home/script.js', { root: __dirname }));
app.post('/fileupload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    minioClient.putObject('interact', fileName, fileBuffer, (err, etag) => {
        if (err) {
            return res.status(500).send(err);
        }
        
        console.log('File uploaded successfully. ETag: ', etag);
        res.send('File uploaded successfully.');
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))