const router = require('express').Router();
const multer = require('multer');
const { uploadFile } = require('../../../utils/fileHandle/uploadFile');
const { reqToHeaders } = require('../../../utils/reqToHeaders');

// Multer storage for images (memory)
const imageUpload = multer({ storage: multer.memoryStorage() });

router.post('/', imageUpload.single('file'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const fileName = `${UUIDv4()}.${req.file.originalname.split('.').pop()}`;

        await minioClient.putObject('interact-images', fileName, fileBuffer);
        res.send({ success: true, fileID: fileName });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.get('/:fileID', async (req, res) => {
    const fileID = req.params.fileID;

    minioClient.getObject('interact-images', fileID, (err, dataStream) => {
        if (err) return res.status(500).send({ error: err.message });

        res.setHeader('Content-Type', mime.lookup(fileID) || 'application/octet-stream');
        dataStream.pipe(res);
    });
});

module.exports = router;