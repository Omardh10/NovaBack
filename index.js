/* all thing in this page */
const mongoose = require('mongoose');
const express = require('express');
const postroute = require('./routes/posts');
const dotenv = require('dotenv');
const commentroutes = require('./routes/comments');
const userroute = require('./routes/users');
const categroute = require("./routes/categories");
const routpasswod = require('./routes/password');
const { ConnectToDb } = require('./utils/db');
const { server, app } = require('./socket/socket');
const cors = require('cors')
dotenv.config();
app.use(express.json());
ConnectToDb();
app.use(cors())

app.use('/api/users', userroute)
app.use('/api/posts', postroute)
app.use('/api/comments', commentroutes)
app.use('/api/categories', categroute)
app.use('/api/password', routpasswod)


app.use((req, res, next) => {
    const error = new Error("This page is not Found")
    res.status(404)
    next(error);
})

app.use((error, req, res, next) => {
    res.status(401).json({ message: error.message });
})




server.listen(process.env.PORT || 8000, () => {
    console.log(`port is ${process.env.PORT}`);

})

