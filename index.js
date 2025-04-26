/* all thing in this page */
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const postroute = require('./routes/posts');
const dotenv = require('dotenv');
const commentroutes = require('./routes/comments');
const userroute = require('./routes/users');
const categroute = require("./routes/categories");
const routpasswod = require('./routes/password');
const { ConnectToDb } = require('./utils/db');
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
dotenv.config();
app.use(express.json());
ConnectToDb();

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


const users = {};

const sendNotification = (userId, message, data) => {
    if (users[userId]) {
        io.to(users[userId].socketId).emit('notification', {
            message,
            data,
            timestamp: new Date()
        });
    }
};

// code socket io()

io.on('connection', (socket) => {
    console.log('user connected', socket.id);

    const userId = socket.handshake.query.userId
    if (userId !== undefined) users[userId] = socket.id
    io.emit('GetOnlineUsers', Object.keys(users))






    socket.on('diconnect', () => {
        console.log('user disconnected');
        delete users[userId]
        io.emit('GetOnlineUsers', Object.keys(users));
    })
})

server.listen(8000, () => {
    console.log(`port is ${process.env.PORT}`);

})

module.exports = { server, io, app,sendNotification }