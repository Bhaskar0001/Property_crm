import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './index';
import { logger } from '../utils/logger';

let io: SocketServer | null = null;

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: config.cors?.origins || '*',
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        role: string;
      };

      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info(`Socket connected: user=${userId} socket=${socket.id}`);

    // Join user-specific room for targeted notifications
    socket.join(`user:${userId}`);

    // Join role-based rooms
    const role = (socket as any).userRole;
    socket.join(`role:${role}`);

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: user=${userId} reason=${reason}`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket() first.');
  }
  return io;
};

// Emit to a specific user
export const emitToUser = (userId: string, event: string, data: any): void => {
  try {
    const socketIO = getIO();
    socketIO.to(`user:${userId}`).emit(event, data);
  } catch (error) {
    logger.error({ err: error }, `Failed to emit to user ${userId}`);
  }
};

// Emit to all admins
export const emitToAdmins = (event: string, data: any): void => {
  try {
    const socketIO = getIO();
    socketIO.to('role:admin').emit(event, data);
  } catch (error) {
    logger.error({ err: error }, 'Failed to emit to admins');
  }
};

// Emit to all staff
export const emitToAll = (event: string, data: any): void => {
  try {
    const socketIO = getIO();
    socketIO.emit(event, data);
  } catch (error) {
    logger.error({ err: error }, 'Failed to emit to all');
  }
};
