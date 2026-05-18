const express = require('express');
const router = express.Router();
const { stkPush } = require('../controllers/mpesaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/stkpush', protect, stkPush);

module.exports = router;