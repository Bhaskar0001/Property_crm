import { Queue } from 'bullmq';
import { getRedis, isRedisAvailable } from './redis';
import { logger } from '../utils/logger';

const queues: Map<string, Queue> = new Map();

export const QUEUE_NAMES = {
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  NOTIFICATION: 'notification',
  IMAGE_PROCESSING: 'image-processing',
  CURRENCY_REFRESH: 'currency-refresh',
  IMPORT: 'import',
  AI: 'ai',
} as const;

export const createQueue = (name: string): Queue | null => {
  if (queues.has(name)) {
    return queues.get(name)!;
  }

  if (!isRedisAvailable()) {
    return null;
  }

  const redis = getRedis();
  if (!redis) return null;

  try {
    const queue = new Queue(name, {
      connection: redis.duplicate(),
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    queues.set(name, queue);
    logger.info(`Queue "${name}" created`);
    return queue;
  } catch (err: any) {
    logger.warn(`Failed to create BullMQ queue "${name}": ${err.message}. Operations will continue in standalone mode.`);
    return null;
  }
};

export const getQueue = (name: string): Queue | null => {
  return queues.get(name) || null;
};

export const initializeQueues = (): void => {
  if (!isRedisAvailable()) {
    logger.info('ℹ️ Redis is offline — BullMQ queues disabled. Background tasks will execute synchronously.');
    return;
  }

  Object.values(QUEUE_NAMES).forEach((name) => {
    createQueue(name);
  });
  logger.info('All BullMQ queues initialized');
};

export const closeAllQueues = async (): Promise<void> => {
  if (queues.size === 0) return;
  for (const [name, queue] of queues) {
    try {
      await queue.close();
      logger.info(`Queue "${name}" closed`);
    } catch {
      // ignore
    }
  }
  queues.clear();
};
