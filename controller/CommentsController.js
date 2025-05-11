const asynchandler = require('express-async-handler');
const { validatcreateComment, Comment, validatupdateComment } = require('../models/Comment');
const { User } = require('../models/User');
const { Post } = require('../models/Post');
const { SendNotification } = require('../socket/socket');

const NewComment = asynchandler(async (req, res) => {

    const { error } = validatcreateComment(req.body)
    if (error) {
        return res.status(404).json({ message: error.details[0].message })
    }
    const getusername = await User.findById(req.user.id);
    const newcomment = new Comment({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        /* username: getusername.username,
         profilephoto: getusername.profilephoto.url*/
    })
    await newcomment.save();
    const post = await Post.findById(req.body.postId);
    if (post.user.toString() !== req.user.id) {
        SendNotification(post.user.toString(), 'New comment on your post', {
            postId: post._id,
            commentId: newcomment._id,
            userId: req.user.id,
            type: 'new_comment'
        });
    }
    res.status(201).json({ status: "success", newcomment })
})

const GetAllComments = asynchandler(async (req, res) => {
    const comments = await Comment.find().populate('user', ["username", "profilephoto"])
    // .populate("user", ["-password"])
    res.status(200).json({ status: "success", comments })
})

const GetSingleComment = asynchandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id).populate('user', ["username", "profilephoto"])
    if (!comment) {
        return res.status(404).json({ message: "comment not found" })
    }
    res.status(200).json({ status: "success", comment })
    // .populate("user", ["-password"])
})

const UpdateComment = asynchandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
        return res.status(404).json({ message: "comment not found" })
    }
    const { error } = validatupdateComment(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message })
    }

    if (req.user.id === comment.user.toString()) {
        const updatecomment = await Comment.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                text: req.body.text
            }
        }, { new: true })
        return res.status(201).json({ status: "success", updatecomment })
    } else {
        return res.status(404).json({ message: "you are not allwod only user have comment ..." })
    }
})

const DeleteComment = asynchandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return res.status(404).json({ message: "comment not found" })
    }
    else {
        if (req.user.id === comment.user.toString() || req.user.isAdmin) {
            await Comment.deleteOne({ _id: req.params.id })
            return res.status(200).json({ message: "deleted seccussfully" })
        }
    }
})


module.exports = {
    NewComment,
    UpdateComment,
    GetAllComments,
    GetSingleComment,
    DeleteComment
}