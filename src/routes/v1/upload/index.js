const router = require('express').Router();
const multer = require('multer');
const { uploadFile } = require('../../../utils/fileHandle/uploadFile');
const { reqToHeaders } = require('../../../utils/reqToHeaders');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('file'), async (req, res) => {
    const headers = reqToHeaders(req);

    const result = await uploadFile(req.file, headers)

    console.log('result:', result);
    if (result.error) {
        return res.status(500).send(result);
    }
    return res.send(result);
});

module.exports = router;