const mongoose = require('mongoose');
const joi = require('joi');

const Commentschema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profilephoto:{
        type:String,
        required:true
    },
}, { timestamps: true });
const Comment = mongoose.model("Comment", Commentschema)

const validatcreateComment = (obj) => {
    const schema = joi.object({
        text: joi.string().trim().required(),
        postId: joi.string().required(),
    })
    return schema.validate(obj)
}

const validatupdateComment = (obj) => {
    const schema = joi.object({
        text: joi.string().trim().required(),
    })
    return schema.validate(obj)
}
module.exports = {
    Comment,
    validatupdateComment,
    validatcreateComment
}