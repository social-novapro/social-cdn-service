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

router.post('/', videoUpload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.filename;

    console.log(filePath, fileName);

    try {
        uploadVideoToMinio(filePath, fileName, res);
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: err.message });
    }
});
router.get('/:fileID', async (req, res) => {
    const fileID = req.params.fileID;
    const range = req.headers.range;
    console.log("Request Headers:", req.headers);


    if (!range) {
        console.log("No range given");
        return res.status(400).send("Requires Range header");
    }

    try {
        minioClient.statObject('interact-videos', fileID, (err, stat) => {
            if (err) {
                console.error("MinIO statObject error:", err);
                return res.status(500).send({ error: "Could not retrieve file info" });
            }

            const fileSize = stat.size;
            const CHUNK_SIZE = 10 ** 6; // 1MB
            const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
            const start = parseInt(startStr, 10);
            let end = endStr ? parseInt(endStr, 10) : start + CHUNK_SIZE - 1;
            end = Math.min(end, fileSize - 1); // Ensure end is within bounds
            const contentLength = end - start + 1;
            const type = mime.lookup(fileID) || 'video/mp4';

            console.log(`Serving ${fileID}: ${start}-${end}/${fileSize}`);

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": type,
                "Cache-Control": "no-store"
            });

            // ✅ Correct way to stream only required range
            minioClient.getObject('interact-videos', fileID, (err, stream) => {
                if (err) {
                    console.error("MinIO getObject error:", err);
                    return res.status(500).send({ error: "Could not retrieve file content" });
                }

                let bytesSent = 0;
                stream.on("data", (chunk) => {
                    if (bytesSent < contentLength) {
                        const remaining = contentLength - bytesSent;
                        const chunkToSend = chunk.slice(0, remaining);
                        res.write(chunkToSend);
                        bytesSent += chunkToSend.length;
                    }

                    if (bytesSent >= contentLength) {
                        stream.destroy(); // Stop reading once enough bytes sent
                        res.end();
                    }
                });

                stream.on("end", () => res.end());
                stream.on("error", (err) => {
                    console.error("Stream error:", err);
                    res.status(500).send(err);
                });
            });
        });

    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).send({ error: err.message });
    }
});



module.exports = router;

//curl -v -H "Range: bytes=0-999999" http://localhost:5005/v1/video/8f958fe2-0e8a-42f6-a9e9-abab8d54aac2.mov
