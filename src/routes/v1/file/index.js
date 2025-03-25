const { getFileInfo } = require('../../../utils/fileInfo');
const { reqToHeaders } = require('../../../utils/reqToHeaders');

const router = require('express').Router();

router.get('/:fileID', async (req, res) => {
    const headers = reqToHeaders(req.headers);
    const foundFile = await getFileInfo(headers, req.params.fileID);

    if (foundFile.error) {
        return res.status(foundFile.status).json({ error: true, message: foundFile.message });
    }
    return res.status(200).json(foundFile);
});

module.exports = router;
