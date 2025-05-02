const express=require("express");
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const users = {};
app.use(cors())
const SendNotification = (userId, message, data) => {
    if (users[userId]) {
        io.to(users[userId]).emit('notification', { // استخدام users[userId] مباشرةً
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



    socket.on('disconnect', () => {
        console.log('user disconnected');
        delete users[userId]
        io.emit('GetOnlineUsers', Object.keys(users));
    })
})
module.exports = { io, server, SendNotification,app };