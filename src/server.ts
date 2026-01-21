import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { config } from './config/env';
import { logger } from './utils/logger';
import { setupSocket } from './realtime/socket';

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

// Setup all socket handlers
setupSocket(io);

export const startServer = () => {
  httpServer.listen(config.port, () => {
    logger.info(`Lobby server running on port ${config.port}`);
  });
};

export { io };
