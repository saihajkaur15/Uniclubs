require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const setupChatSocket = require('./sockets/chatSocket');

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use(express.static(path.join(__dirname, '../..')));

// This is test route
app.get('/api/health', (req, res) => res.json({ success: true, message: 'UniClubs API running' }));
app.use('/api/auth', require('./routes/authRoutes')); // if /login nu post kita te ethe oh call karega /api/auth/login nu
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

setupChatSocket(io); // frontend ek var connect hoyega te hamesha backend nal gal kar sakda hai

//Error handling middleware hai ye
app.use(notFound); 
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
