const { VerifyToken, GetPosts, GetSinglePost, NewPost, DeletePost, UpdatePost, UpdateImagePost, AddLike } = require('../controller/PostsController');
const { uploadphoto } = require('../meddlwer/uplodmidl');
const { verifytoken } = require('../meddlwer/verifyalltoken');
const express = require('express');
const router = express.Router();

// Get All Posts
router.get('/', GetPosts)

// Verify Token
router.post('/verify-token', VerifyToken)

// Get Single Post
router.get('/:id', GetSinglePost)

// New Post 
router.post('/', verifytoken, uploadphoto.single('image'), NewPost)

// Delete Post
router.delete('/:id', verifytoken, DeletePost)

// Update Post
router.patch('/:id', verifytoken, UpdatePost)

// Update Image Post
router.patch('/upload-image/:id', verifytoken, uploadphoto.single("image"), UpdateImagePost)

// ADD && Dis Like On Post
router.patch('/like/:id', verifytoken, AddLike)




















module.exports = router;