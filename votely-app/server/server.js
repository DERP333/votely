const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const pollRoutes = require('./routes/pollRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for development
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Pass socket.io to express app for access in controllers
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Votely Real-Time API',
    timestamp: new Date().toISOString()
  });
});

// Socket.io Real-Time connection management
io.on('connection', (socket) => {
  console.log(`🔌 New client connected via Socket.io: ${socket.id}`);

  // Allow clients to join specific poll rooms for live updates
  socket.on('join_poll', (pollId) => {
    socket.join(`poll_${pollId}`);
    console.log(`Socket ${socket.id} joined room poll_${pollId}`);
  });

  socket.on('leave_poll', (pollId) => {
    socket.leave(`poll_${pollId}`);
    console.log(`Socket ${socket.id} left room poll_${pollId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`🚀 Votely Server running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket server active for real-time live polling`);
});

