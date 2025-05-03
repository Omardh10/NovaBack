const { VerifyToken, GetPosts, GetSinglePost, NewPost, DeletePost, UpdatePost, UpdateImagePost, AddLike } = require('../controller/PostsController');
const { uploadphoto } = require('../meddlwer/uplodmidl');
const { verifytoken } = require('../meddlwer/verifyalltoken');
const express = require('express');
const router = express.Router();

router.get('/', GetPosts)

router.post('/verify-token', VerifyToken)

router.get('/:id', GetSinglePost)

router.post('/', verifytoken, uploadphoto.single('image'), NewPost)

router.delete('/:id', verifytoken, DeletePost)

router.patch('/:id', verifytoken, UpdatePost)

router.patch('/upload-image/:id', verifytoken, uploadphoto.single("image"), UpdateImagePost)

router.patch('/like/:id', verifytoken, AddLike)




















module.exports = router;