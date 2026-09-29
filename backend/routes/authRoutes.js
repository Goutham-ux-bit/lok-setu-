const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { identify } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', identify, me);

module.exports = router;
