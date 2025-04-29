const express=require("express");
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost8000",
        methods: ["GET", "POST"]
    }
});
const users = {};

const SendNotification = (userId, message, data) => {
    if (users[userId]) {
        return io.to(users[userId].socketId).emit('notification', {
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
module.exports = { io, server, SendNotification,app };