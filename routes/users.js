const express = require('express');
const router = express.Router();
const { RegisterUser, GetUsers, GetUser, LoginUser, UpdateUser, DeleteUser, PostImageUser, FollowUser, CheckEmailUser } = require('../controller/userscontroller');
const { verifytoken, verifytokenandisAdmin, verifytokenandonlyuser, verifytokenandauthorization } = require('../meddlwer/verifyalltoken');
const { uploadphoto } = require('../meddlwer/uplodmidl');


// Get All Users 
router.get('/profile', verifytokenandisAdmin, GetUsers)

// Get Single User
router.get('/profile/:id',GetUser)

// Register New User
router.post('/register', RegisterUser)

// Login Old User
router.post('/login',LoginUser)

// Update User
router.patch('/profile/:id', verifytokenandonlyuser,UpdateUser)

// Delete User
router.delete('/profile/:id', verifytokenandauthorization, DeleteUser)

// Post Image User
router.post('/profile/profile-photo-upload', verifytoken, uploadphoto.single('image'), PostImageUser)

// Follow && FollowBack User
router.patch('/follow/:id', verifytoken, FollowUser)

// Check Email User
router.get('/checkemail', CheckEmailUser)



module.exports = router;

