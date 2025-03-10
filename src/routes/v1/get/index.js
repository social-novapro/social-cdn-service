const router = require('express').Router();
const { getFile } = require("../../../utils/fileHandle/getFile");
const { reqToHeaders } = require('../../../utils/reqToHeaders');
const mime = require('mime-types');

router.get('/:fileID', async (req, res) => {
    const headers = reqToHeaders(req);
    const fileID = req.params.fileID;
    console.log(fileID);
    
    try {
        const file = await getFile(fileID, headers);

        if (file.error) {
            return res.status(500).send(file);
        }

        // Send the file buffer as a response
        // Determine the MIME type based on the file extension or content
        console.log(mime.lookup(fileID));
        const mimeType = mime.lookup(fileID) || 'application/octet-stream';

        // Set the Content-Type header to render the file in the browser
        res.setHeader('Content-Type', mimeType);
        // res.setHeader('Content-Disposition', 'inline');

        return res.status(200).send(file.file);
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
});

module.exports = router;