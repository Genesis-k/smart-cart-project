const express = require('express');
const { stkPush, mpesaCallback } = require('../controllers/mpesaController');

// Assuming you have an auth middleware. If you don't, remove `protect` from the route below.
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

// The frontend calls this to trigger the phone prompt
router.post('/stkpush', protect, stkPush);

// Safaricom's servers call this secretly in the background
router.post('/callback/:id', mpesaCallback);

module.exports = router;