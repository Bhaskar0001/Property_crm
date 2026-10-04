import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedis, isRedisAvailable } from '../config/redis';
import { config } from '../config';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  // 1. MongoDB Check with ping
  let mongoStatus = 'disconnected';
  let mongoLatencyMs = -1;
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      mongoLatencyMs = Date.now() - pingStart;
      mongoStatus = 'connected';
    }
  } catch {
    mongoStatus = 'error';
  }

  // 2. Redis Check with ping
  let redisStatus = 'disconnected';
  let redisLatencyMs = -1;
  if (isRedisAvailable()) {
    try {
      const redis = getRedis();
      if (redis) {
        const pingStart = Date.now();
        await redis.ping();
        redisLatencyMs = Date.now() - pingStart;
        redisStatus = 'connected';
      }
    } catch {
      redisStatus = 'disconnected';
    }
  }

  // 3. Cloud Storage (Cloudflare R2 or Local)
  const isR2Configured = Boolean(
    config.r2.accountId &&
    config.r2.accessKeyId &&
    config.r2.secretAccessKey &&
    config.r2.bucketName
  );
  const storageStatus = isR2Configured ? 'r2_configured' : 'local_storage_fallback';

  // 4. Email (Resend) Status
  const isEmailConfigured = Boolean(config.resend.apiKey || process.env.RESEND_API_KEY);
  const emailStatus = isEmailConfigured ? 'configured' : 'not_configured';

  // 5. System metrics
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const isOperational = mongoStatus === 'connected';

  res.status(isOperational ? 200 : 503).json({
    success: isOperational,
    data: {
      status: isOperational && redisStatus === 'connected' ? 'healthy' : isOperational ? 'operational (standalone)' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      uptimeSeconds,
      environment: config.env,
      services: {
        mongodb: {
          status: mongoStatus,
          latencyMs: mongoLatencyMs >= 0 ? mongoLatencyMs : undefined,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatencyMs >= 0 ? redisLatencyMs : undefined,
        },
        storage: {
          status: storageStatus,
          provider: isR2Configured ? 'Cloudflare R2' : 'Local Disk',
        },
        email: {
          status: emailStatus,
          provider: 'Resend',
        },
      },
      system: {
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      },
    },
  });
});
