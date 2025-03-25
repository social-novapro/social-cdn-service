const router = require('express').Router();
const { reqToHeaders } = require('../../../utils/reqToHeaders');
const { verifyFile } = require('../../../utils/fileHandle/verifyFile');

router.get('/:fileName', (req, res) => {
    const headers = reqToHeaders(req.headers);
    const fileType = verifyFile(req.params.fileName);

    if (fileType.error) {
        return res.status(500).send(fileType);
    }
    return res.status(200).send(fileType);
});

module.exports = router;