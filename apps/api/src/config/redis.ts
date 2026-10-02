import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let isRedisConnected = false;
let hasLoggedUnavailable = false;

export const isRedisAvailable = (): boolean => {
  return isRedisConnected && redisClient !== null && (redisClient.status === 'ready' || redisClient.status === 'connect');
};

export const connectRedis = async (): Promise<Redis | null> => {
  if (redisClient && isRedisConnected) return redisClient;

  try {
    redisClient = new Redis(config.redis.url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      enableOfflineQueue: false,
      connectTimeout: 2000,
      retryStrategy(times: number) {
        if (times >= 1) {
          // Do not spam retry loops when Redis is offline
          return null;
        }
        return 2000;
      },
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      hasLoggedUnavailable = false;
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
    });

    redisClient.on('close', () => {
      isRedisConnected = false;
    });

    redisClient.on('error', (err: any) => {
      isRedisConnected = false;
      if (!hasLoggedUnavailable) {
        hasLoggedUnavailable = true;
        logger.warn(`⚠️ Redis is unavailable at ${config.redis.url} (${err.code || err.message || 'offline'}). Running in standalone mode without Redis.`);
      }
    });

    await redisClient.connect();
    isRedisConnected = true;
    return redisClient;
  } catch (error: any) {
    isRedisConnected = false;
    if (!hasLoggedUnavailable) {
      hasLoggedUnavailable = true;
      logger.warn(`⚠️ Redis is offline (${error.code || error.message || 'connection failed'}). Running in standalone mode without Redis.`);
    }
    return null;
  }
};

export const getRedis = (): Redis | null => {
  return isRedisAvailable() ? redisClient : null;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      if (isRedisConnected) {
        await redisClient.quit();
      } else {
        redisClient.disconnect();
      }
    } catch {
      // ignore
    }
    redisClient = null;
    isRedisConnected = false;
  }
};
