const router = require('express').Router();
const multer = require('multer');
const { uploadFile } = require('../../../utils/fileHandle/uploadFile');
const { reqToHeaders } = require('../../../utils/reqToHeaders');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), async (req, res) => {
    const headers = reqToHeaders(req);
    uploadFile(req.file, headers, res)
});

module.exports = router;