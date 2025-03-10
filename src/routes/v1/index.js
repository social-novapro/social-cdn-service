const router = require('express').Router();

router.use('/serverStatus', require('./serverStatus'));
router.use('/upload', require('./upload'));
router.use('/get', require('./get'));

module.exports = router;
