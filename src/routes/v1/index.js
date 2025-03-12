const router = require('express').Router();

router.use('/static', require('./cdn'));
router.use('/serverStatus', require('./serverStatus'));
router.use('/image', require('./image'));
router.use('/video', require('./video'));
router.use('/fileType', require('./fileType'));

module.exports = router;
