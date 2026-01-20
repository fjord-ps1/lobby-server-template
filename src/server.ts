import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { config } from './config/env';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Serve static demo files
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Socket.IO connection handler (placeholder for now)
io.on('connection', (socket) => {
  logger.info('Player connected', { socketId: socket.id });
  
  socket.on('disconnect', () => {
    logger.info('Player disconnected', { socketId: socket.id });
  });
});

export const startServer = () => {
  httpServer.listen(config.port, () => {
    logger.info(`Lobby server running on port ${config.port}`);
  });
};

export { io };
