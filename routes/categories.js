const express = require('express');
const asynchandler = require('express-async-handler');
const { verifytoken, verifytokenandisAdmin } = require('../meddlwer/verifyalltoken');
const { validatcreateCategory, Category } = require('../models/Category');
const router = express.Router();

router.get('/', asynchandler(async (req, res) => {
    const categories = await Category.find().populate("userId", ["_id", "username"]);
    res.status(200).json({ status: "success", categories })
}))
router.get('/:id', asynchandler(async (req, res) => {
    const category = await Category.findById().populate("userId", ["_id", "username"]);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    } else {
        res.status(200).json({ status: "success", category })
    }

}))
router.post('/', verifytokenandisAdmin, asynchandler(async (req, res) => {
    const { error } = validatcreateCategory(req.body)
    if (error) {
        return res.status(404).json({ message: error.details[0].message })
    }
    const newcategory = new Category({
        category: req.body.category,
        userId: req.user.id
    })
    await newcategory.save();
    res.status(201).json({ status: "success", newcategory })
}))
router.patch('/:id', verifytokenandisAdmin, asynchandler(async (req, res) => {
    let category = await Category.findById(req.params.id)
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    } else {

        category = await Category.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                category: req.body.category
            }
        }, { new: true })
        res.status(200).json({ status: "success", category })
    }
}
))
router.delete('/:id', verifytokenandisAdmin, asynchandler(async (req, res) => {
    let category = await Category.findById()
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    } else {
        category = await Category.deleteOne({ _id: req.params.id })
        res.status(200).json({ message: "deleted seccussfully" })
    }
}))
module.exports = router;