const express = require('express');
const router = express.Router();
const { verifytoken } = require('../meddlwer/verifyalltoken');
const { DeleteComment, UpdateComment, NewComment, GetSingleComment, GetAllComments } = require('../controller/CommentsController');

router.get('/',GetAllComments)

router.get('/:id', GetSingleComment)

router.post('/', verifytoken, NewComment)

router.patch('/:id', verifytoken, UpdateComment)

router.delete('/:id', verifytoken,DeleteComment)



module.exports = router