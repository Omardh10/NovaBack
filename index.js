/* all thing in this page */
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const postroute = require('./routes/posts');
const dotenv = require('dotenv');
const commentroutes = require('./routes/comments');
const userroute = require('./routes/users');
const categroute = require("./routes/categories");
const routpasswod=require('./routes/password');
const { ConnectToDb } = require('./utils/db');

dotenv.config();
app.use(express.json());

ConnectToDb();
// mongoose.connect("mongodb://localhost/blogDb").then(() => {
//     console.log("connect to db");

// })

app.use('/api/users', userroute)
app.use('/api/posts', postroute)
app.use('/api/comments', commentroutes)
app.use('/api/categories', categroute)
app.use('/api/password',routpasswod )


app.use((req, res, next) => {
    const error = new Error("This page is not Found")
    res.status(404)
    next(error);
})

app.use((error, req, res, next) => {
    res.status(401).json({ message: error.message });
})

app.listen(2500, () => {
    console.log("port 8000");

})