const mongoose = require('mongoose');
const joi = require('joi');

const Postschema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        unique: true,
        minlength: 3,
        required: true
    },
    // category: {
    //     type: String,
    //     trim: true,
    //     required: true
    // },
    image: {
        type: Object,
        default: {
            url: "",
            publicId: null
        }
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

Postschema.virtual("comments", {
    ref: "Comment",
    foreignField: "postId",
    localField: "_id"
})

const Post = mongoose.model('Post', Postschema)

const validatcreate = (obj) => {
    const schema = joi.object({

        title: joi.string().trim().min(3).max(200).required(),
        description: joi.string().trim().min(3).required(),
        // category: joi.string().trim().required(),

    })
    return schema.validate(obj)
}

const validatupdate = (obj) => {
    const schema = joi.object({
        title: joi.string().trim().min(3).max(200),
        description: joi.string().trim().min(3),
        category: joi.string().trim(),
    })
    return schema.validate(obj)
}
module.exports = {
    Post,
    validatupdate,
    validatcreate
}