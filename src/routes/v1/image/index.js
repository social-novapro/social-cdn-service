const router = require('express').Router();
const multer = require('multer');
const { uploadImage } = require('../../../utils/fileHandle/uploadFile');
const { reqToHeaders } = require('../../../utils/reqToHeaders');
const { getFile } = require('../../../utils/fileHandle/getFile');

// Multer storage for images (memory)
const imageUpload = multer({ storage: multer.memoryStorage() });

router.post('/', imageUpload.single('file'), async (req, res) => {
    const headers = reqToHeaders(req);
    await uploadImage(req.file, headers, res);
});

router.get('/:fileID', async (req, res) => {
    const fileID = req.params.fileID;
    const headers = reqToHeaders(req);

    await getFile(fileID, headers, 'interact-images', res);
});

module.exports = router;