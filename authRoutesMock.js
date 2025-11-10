const express = require('express');
const router = express.Router();

const { signup, login, me } = require('../controllers/authController.mock');
const auth = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, me);

module.exports = router;