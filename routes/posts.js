const express = require('express');
const { verifytoken } = require('../meddlwer/verifyalltoken');
const { uploadphoto } = require('../meddlwer/uplodmidl');
const asynchandler = require('express-async-handler');
const { validatcreate, Post } = require('../models/Post');
const { UploadImage, RemoveImage } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');
const { Comment } = require('../models/Comment');

const router = express.Router();


router.get('/', asynchandler(async (req, res) => {
    /* const query=req.query;
    const page=query.page||1;
    const limit=query.limit||2;
    const skip=(page-1)*limit;
    after that i written .skip(skip).limit(limit).populate("user",["-password"]);
    */
    const post_item = 1;
    const { pagenumber, category } = req.query;
    let posts;
    if (pagenumber) {

        posts = await Post.find().skip((pagenumber - 1) * post_item).limit(post_item).populate("user", ["-password"])


        res.status(201).json({ posts });

    }
    if (category) {
        posts = await Post.find({ category }).populate("user", ["-password"]);

        res.status(201).json({ posts });
    }
    else {
        posts = await Post.find().populate("user", ["-password"]);
        res.status(201).json({ posts });
    }

}))

router.get('/:id', asynchandler(async (req, res) => {

    let post;

    post = await Post.findById(req.params.id).populate("user", ["-password"]).populate("comments");

    if (!post) {

        res.status(400).json({ message: "this post not found" })

    } else {

        res.status(201).json({ post })

    }

}))

router.post('/', verifytoken, uploadphoto.single('image'), asynchandler(async (req, res) => {
    if (!req.file) {
        res.status(404).json({ message: "no file provided" })
    }
    const { error } = validatcreate(req.body);
    if (error) {
        res.status.json({ message: error.details[0].message })
    }
    const pathimg = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await UploadImage(pathimg);
    const newpost = new Post({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id
        }
    })
    newpost.save();
    res.status(201).json(newpost);
    fs.unlinkSync(pathimg);
}))
router.delete('/:id', verifytoken, asynchandler(async (req, res) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404).json({ message: "this post not found" })
    } else {
        if (req.user.id === post.user.toString() || req.user.isAdmin) {
            await Post.deleteOne({ _id: req.params.id })
            await Comment.deleteMany({ postId: post._id })
            await RemoveImage(post.image.publicId)
            res.status(201).json({ message: "deleted seccussfully" })
        } else {
            res.status(403).json({ message: "you are not allwod only user or isAdmin" })
        }
    }
}))
router.patch('/:id', verifytoken, asynchandler(async (req, res) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404).json({ message: "this post not found" })
    }
    if (req.user.id === post.user.toString()) {
        const updatepost = await Post.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category
            }
        }, { new: true })
        res.status(200).json(updatepost);
    } else {
        res.status(405).json({ message: "you are not allwod only user" })
    }
}))

router.patch('/upload-image/:id', verifytoken, uploadphoto.single("image"), asynchandler(async (req, res) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404).json({ message: "this post not found" })
    }
    if (req.user.id === post.user.toString()) {
        await RemoveImage(post.image.publicId)
        const pathimag = path.join(__dirname, `../images/${req.file.filename}`)
        const result = await UploadImage(pathimag);
        const updatepostimage = await Post.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                image: {
                    url: result.secure_url,
                    publicId: result.public_id
                }
            }
        }, { new: true })
        res.status(200).json(updatepostimage);
        fs.unlinkSync(pathimag);
    } else {
        res.status(405).json({ message: "you are not allwod only user" })
    }
}))
router.patch('/like/:id', verifytoken, asynchandler(async (req, res) => {
    let post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404).json({ message: "this post not found" })
    }
    ispostlike = post.likes.find((user) => user.toString() === req.user.id);
    if (ispostlike) {
        post = await Post.findByIdAndUpdate({ _id: req.params.id }, {
            $pull: { likes: req.user.id }
        }, { new: true })
    } else {
        post = await Post.findByIdAndUpdate({ _id: req.params.id }, {
            $push: { likes: req.user.id }
        }, { new: true })
    }
    res.status(201).json(post)
}))




















module.exports = router;