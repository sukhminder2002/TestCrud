const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post(
    '/register',
    [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
    validate,
    register
);
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
