const { minioClient } = require('../../utils/minio');

const router = require('express').Router();

router.use('/cdn', require('./cdn'));
router.use('/serverStatus', require('./serverStatus'));
router.use('/upload', require('./upload'));
router.use('/get', require('./get'));
router.use('/image', require('./image'));
router.use('/video', require('./video'));

module.exports = router;
