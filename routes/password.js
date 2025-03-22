const express = require('express');
const router = express.Router();
const asynchandler = require('express-async-handler');
const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
router.post('/forgot-password', asynchandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(403).json({ message: "user not found" });
    }
    try {
        const secret_key = process.env.JWT_KEY + user.password
        const token = jwt.sign({ id: user._id, email: user.email }, secret_key, {
            expiresIn: '10m'
        })
        user.token = token;
        const link = `http://localhost:8000/api/password/reset-password/${user._id}/${token}`
        res.status(201).json({ message: "click on this link please", link })
    } catch (error) {
        res.status(500).json({ message: "error something false" })
    }
}))

router.post('/reset-password/:userId/:token', asynchandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(403).json({ message: "user not found" });
    }
    try {
        const secret_key = process.env.JWT_KEY + user.password
        jwt.verify(req.params.token, secret_key)
        const hashpassword = await bcrypt.hash(req.body.password, 10)
        req.body.password = hashpassword;
        user.password = req.body.password
        await user.save();

        res.status(201).json({ success: true, username: user.username, password: user.password, email: user.amil })

    } catch (error) {
        res.status(500).json({ message: "error something false" })
    }
}))
















module.exports = router