require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const setupChatSocket = require('./sockets/chatSocket');

connectDB();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

setupChatSocket(io); // frontend ek var connect hoyega te hamesha backend nal gal kar sakda hai

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
