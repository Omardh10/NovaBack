const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

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



module.exports = { server, io, app,sendNotification }