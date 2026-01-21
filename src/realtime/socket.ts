import { Server } from 'socket.io';
import { ClientEvents, ServerEvents } from '../types/events';
import { registerHandlers } from './handlers';
import { logger } from '../utils/logger';

export const setupSocket = (io: Server<ClientEvents, ServerEvents>) => {
  io.on('connection', (socket) => {
    logger.info('Player connected', { socketId: socket.id });
    
    registerHandlers(io, socket);
    
    socket.on('disconnect', () => {
      logger.info('Player disconnected', { socketId: socket.id });
    });
  });
};
