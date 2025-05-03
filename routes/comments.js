const express = require('express');
const router = express.Router();
const { verifytoken } = require('../meddlwer/verifyalltoken');
const { DeleteComment, UpdateComment, NewComment, GetSingleComment, GetAllComments } = require('../controller/CommentsController');

// Get All Comments
router.get('/',GetAllComments)

// Get Single Comment
router.get('/:id', GetSingleComment)

// Post New Comment
router.post('/', verifytoken, NewComment)

// Update Comment
router.patch('/:id', verifytoken, UpdateComment)

// Delete Comment
router.delete('/:id', verifytoken,DeleteComment)



module.exports = router