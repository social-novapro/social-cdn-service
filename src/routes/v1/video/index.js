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
const {ffprobe} = require('fluent-ffmpeg');

const uploadDir = '/tmp/uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage for videos (disk)
const videoUpload = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
    filename: (req, file, cb) => cb(null, `${UUIDv4()}.${file.originalname.split('.').pop()}`)
})});

function getVideoResolution(filePath) {
    return new Promise((resolve, reject) => {
        // Use ffmpeg to probe the video for metadata
        ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                // Retrieve the width and height from the first stream
                const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
                if (videoStream) {
                    const resolution = {
                        width: videoStream.width,
                        height: videoStream.height
                    };
                    console.log('Video resolution:', resolution);
                    resolve(resolution);
                } else {
                    reject(new Error('No video stream found'));
                }
            }
        });
    });
}

router.post('/', videoUpload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.filename;

    console.log(filePath, fileName);

    const fileRes = {
        allowed: true,
        uuid: UUIDv4(),
        originalFilename: req.file.originalname,
        extension: req.file.originalname.split('.').pop(),
        xSize: req.file.size
    }
    console.log(fileRes);

    const resolution = await getVideoResolution(filePath);
    try {
        await uploadVideoToMinio(filePath, fileName, res, resolution);
    } catch (err) {
        console.log("err:" + err);
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
        const stat = await new Promise((resolve, reject) => {
            minioClient.statObject('interact-videos', fileID, (err, stat) => {
                if (err) {
                    console.error("MinIO statObject error:", err);
                    return reject(new Error("Could not retrieve file info"));
                }
                resolve(stat);
            });
        });

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

        const stream = await new Promise((resolve, reject) => {
            minioClient.getObject('interact-videos', fileID, (err, stream) => {
                if (err) {
                    console.error("MinIO getObject error:", err);
                    return reject(new Error("Could not retrieve file content"));
                }
                resolve(stream);
            });
        });

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

    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;

//REMEMBER curl -v -H "Range: bytes=0-999999" http://localhost:5005/v1/video/8f958fe2-0e8a-42f6-a9e9-abab8d54aac2.mov
