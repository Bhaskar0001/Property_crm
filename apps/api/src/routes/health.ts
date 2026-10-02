import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedis, isRedisAvailable } from '../config/redis';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let redisStatus = 'disconnected';

  if (isRedisAvailable()) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.ping();
        redisStatus = 'connected';
      }
    } catch {
      redisStatus = 'disconnected';
    }
  }

  const isOperational = mongoStatus === 'connected';

  res.status(isOperational ? 200 : 503).json({
    success: isOperational,
    data: {
      status: isOperational && redisStatus === 'connected' ? 'healthy' : isOperational ? 'operational (standalone)' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
    },
  });
});
