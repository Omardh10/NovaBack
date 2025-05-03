const express = require('express');
const { ResetPassword, ForgotPassword } = require('../controller/PasswordController');
const router = express.Router();

router.post('/forgot-password', ForgotPassword)

router.post('/reset-password/:userId/:token', ResetPassword)


module.exports = router