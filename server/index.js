const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity (or specify your frontend URL)
        methods: ["GET", "POST"]
    }
});

let onlineCount = 0;

io.on('connection', (socket) => {
    onlineCount++;
    // Broadcast new online count
    io.emit('stats_update', { online: onlineCount });
    console.log(`User connected. Online: ${onlineCount}`);

    // Handle chat message
    socket.on('chat_message', (msg) => {
        // Broadcast to everyone (including sender, simplifies frontend logic)
        io.emit('chat_message', msg);
    });

    socket.on('disconnect', () => {
        onlineCount = Math.max(0, onlineCount - 1);
        io.emit('stats_update', { online: onlineCount });
        console.log(`User disconnected. Online: ${onlineCount}`);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Chat Server running on http://localhost:${PORT}`);
});
