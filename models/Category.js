const mongoose = require('mongoose');
const joi = require('joi');

const Categoryschema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true,
        minlenght:3,
        maxlength:100
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });
const Category = mongoose.model("Category", Categoryschema)

const validatcreateCategory = (obj) => {
    const schema = joi.object({
        category: joi.string().trim().min(3).max(100).required(),
        // userId: joi.string().required(),
    })
    return schema.validate(obj)
}

const validatupdateCategory = (obj) => {
    const schema = joi.object({
        category: joi.string().trim().min(3).max(100),
    })
    return schema.validate(obj)
}
module.exports = {
    Category,
    validatupdateCategory,
    validatcreateCategory
}