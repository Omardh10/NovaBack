const express = require('express');
const router = express.Router();
const asynchandler = require('express-async-handler');
const { User, validatregister, validatlogin, validatupdateuser } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifytoken, verifytokenandisAdmin, verifytokenandonlyuser, verifytokenandauthorization } = require('../meddlwer/verifyalltoken');
const { uploadphoto } = require('../meddlwer/uplodmidl');
const fs = require('fs');
const path = require('path');
const { RemoveImage, UploadImage, RemoveImagemany } = require('../utils/cloudinary');
const { Post } = require('../models/Post');
const { Comment } = require('../models/Comment');
const nodemailer = require('nodemailer');

const generateactivecode = () => {
    return Math.floor(100000 + Math.random() * 900000)
}
router.get('/profile', verifytokenandisAdmin, asynchandler(async (req, res) => {
    // console.log(req.headers.authorization);

    const users = await User.find({}, { "__v": false, "password": false }).populate("posts")
    res.status(201).json({ status: "success", data: users })

}))
router.get('/profile/:id', asynchandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
        return res.status(403).json({ message: "user not found" });
    }
    else {
        return res.status(200).json({ status: "success", user })
    }
}))
router.post('/register', asynchandler(async (req, res) => {
    const { username, email, password, Gender, City, Country, birthdate } = req.body;
    const activcode = generateactivecode();
    const { error } = validatregister(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message })
    }
    const olduser = await User.findOne({ email: email })
    if (olduser) {
        res.status(400).json({ message: "this user already registered" })
    }
    const hashpassword = await bcrypt.hash(password, 10)

    let newuser = new User({
        username,
        email,
        password: hashpassword,
        Gender,
        Country,
        City,
        birthdate
    })
    const token = jwt.sign({ id: newuser._id, isAdmin: newuser.isAdmin }, process.env.JWT_KEY)
    newuser.token = token;
    newuser.save();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            password: process.env.USER_PASS
        },
        tls: {
            rejectUnauthorized: false // يتيح التشفير دون رفض الشهادات غير الموثوقة
        }
    })
    const mailoptions = {
        from: process.env.USER_EMAIL,
        to: newuser.email,
        subject: "hello active your account",
        text: `hello ${username}, this is your activation code ${activcode}`
    }
    transporter.sendMail(mailoptions, (error, success) => {
        if (error) {
            console.log(error);

        } else {
            console.log(success.response);

        }
    })
    res.status(201).json({ status: "success", user: newuser });
}))

router.post('/login', asynchandler(async (req, res) => {
    const { email, password } = req.body;
    const { error } = validatlogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    const user = await User.findOne({ email: email })
    if (!user) {
        return res.status(400).json({ message: "invalid email or password" })
    }
    const matchedpassword = await bcrypt.compare(password, user.password)
    if (!matchedpassword) {
        return res.status(400).json({ message: "invalid email or password" })
    }
    if (user && matchedpassword) {
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_KEY)
        user.token = token;
        // user.save();
        res.status(200).json({ userId: user._id, username: user.username, token: token, });
    }
}))
router.patch('/profile/:id', verifytokenandonlyuser, asynchandler(async (req, res) => {
    const { error } = validatupdateuser(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message })
    }
    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(403).json({ message: "user not found" });
    }
    else {
        if (req.body.password) {
            const hashpassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashpassword;
        }
        const updateuser = await User.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                username: req.body.username,
                birthdate: req.body.birthdate,
                password: req.body.password,
                bio: req.body.bio,
                Gender: req.body.Gender
            }
        }, { new: true })
        return res.status(202).json({ status: "success", user: updateuser })
    }
}))

router.delete('/profile/:id', verifytokenandauthorization, asynchandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(403).json({ message: "user not found" });
    }
    else {
        const posts = await Post.find({ user: user._id })
        const getallpublicides = posts?.map((el) => el.image.publicId)
        if (getallpublicides?.length > 0) {
            await RemoveImagemany(getallpublicides)
        }
        await RemoveImage(user.profilephoto.publicId)
        await User.deleteOne({ _id: req.params.id })
        await Post.deleteMany({ user: user._id })
        await Comment.deleteMany({ user: user._id })
        return res.status(201).json({ message: "deleted seccussfuly ... " })
    }
}))

router.post('/profile/profile-photo-upload', verifytoken, uploadphoto.single('image'), asynchandler(async (req, res) => {
    // console.log(req.file);
    if (!req.file) {
        res.status(404).json({ message: "no image provided" })
    }
    //get the path:
    const pathimg = await path.join(__dirname, `../images/${req.file.filename}`)
    const result = await UploadImage(pathimg);
    const user = await User.findById(req.user.id);
    if (user.profilephoto.publicId !== null) {
        await RemoveImage(user.profilephoto.publicId);
    }
    user.profilephoto = {
        url: result.secure_url,
        publicId: result.public_id
    }
    await user.save();

    res.status(201).json({ message: "image uploaded seccussfully", profilephoto: { url: result.secure_url, publicId: result.public_id } });
    fs.unlinkSync(pathimg);
}))
router.patch('/follow/:id', verifytoken, asynchandler(async (req, res) => {
    let user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    isfollow = user.followers.find(user => user.toString() === req.user.id)
    if (isfollow) {
        user = await User.findByIdAndUpdate({ _id: req.params.id }, {
            $pull: {
                followers: req.user.id
            }
        }, { new: true })
    }
    else {
        user = await User.findByIdAndUpdate({ _id: req.params.id }, {
            $push: {
                followers: req.user.id
            }
        }, { new: true })
    }
    res.status(202).json({ status: "success", user })
}))

module.exports = router;