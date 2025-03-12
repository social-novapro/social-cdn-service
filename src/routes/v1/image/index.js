const router = require('express').Router();
const multer = require('multer');
const { uploadImage } = require('../../../utils/fileHandle/uploadFile');
const { reqToHeaders } = require('../../../utils/reqToHeaders');

// Multer storage for images (memory)
const imageUpload = multer({ storage: multer.memoryStorage() });

router.post('/', imageUpload.single('file'), (req, res) => {
    const headers = reqToHeaders(req);
    uploadImage(req.file, headers, res);
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