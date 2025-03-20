const { getFileInfo } = require('../../../utils/fileInfo');
const { reqToHeaders } = require('../../../utils/reqToHeaders');

const router = require('express').Router();

router.get('/:fileID', async (req, res) => {
    const headers = reqToHeaders(req);
    const foundFile = await getFileInfo(headers, req.params.fileID);
    console.log(foundFile)
    if (foundFile.error) {
        return res.status(foundFile.status).json({ error: true, message: foundFile.message });
    }
});

module.exports = router;
