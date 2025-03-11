const { v4: UUIDv4 } = require('uuid');
const router = require('express').Router();
const multer = require('multer');
const { uploadFile } = require('../../../utils/fileHandle/uploadFile');
const { reqToHeaders } = require('../../../utils/reqToHeaders');
const { uploadVideoToMinio } = require('../../../utils/fileHandle/videos');
const fs = require('fs');
const { minioClient } = require('../../../utils/minio');
const mime = require('mime-types');
const { getFile } = require('../../../utils/fileHandle/getFile');

const uploadDir = '/tmp/uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage for videos (disk)
const videoUpload = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
    filename: (req, file, cb) => cb(null, `${UUIDv4()}.${file.originalname.split('.').pop()}`)
})});

router.post('/', videoUpload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.filename;

    console.log(filePath, fileName);

    try {
        await uploadVideoToMinio(filePath, fileName);
        res.send({ success: true, fileID: fileName });
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: err.message });
    }
});

router.get('/:fileID', async (req, res) => {
    const headers = reqToHeaders(req);
    const fileID = req.params.fileID;
    const range = req.headers.range;

    if (!range) {
        const foundFile = await getFile(fileID, headers, 'interact-videos');
        return res.send(foundFile);
    }

    try {
        const stat = await minioClient.statObject('interact-videos', fileID);
        const fileSize = stat.size;

        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
        const contentLength = end - start + 1;
        const type = mime.lookup(fileID) || 'video/mp4';
        console.log(type)
        res.writeHead(206, {
            "Transfer-Encoding": "chunked",
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": type,
            "Cache-Control": "no-store"
        });

        const stream = await minioClient.getObject('interact-videos', fileID);
        stream.on('data', (chunk) => {
            res.write(chunk);
            console.log(chunk)
        });
        stream.on('end', () => res.end());
        stream.on('error', (err) => res.status(500).send(err));

    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});


module.exports = router;