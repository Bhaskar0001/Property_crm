import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedis } from './redis';
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

export const createQueue = (name: string): Queue => {
  if (queues.has(name)) {
    return queues.get(name)!;
  }

  const redis = getRedis();
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
};

export const getQueue = (name: string): Queue => {
  const queue = queues.get(name);
  if (!queue) {
    throw new Error(`Queue "${name}" not found. Create it first.`);
  }
  return queue;
};

export const initializeQueues = (): void => {
  Object.values(QUEUE_NAMES).forEach((name) => {
    createQueue(name);
  });
  logger.info('All queues initialized');
};

export const closeAllQueues = async (): Promise<void> => {
  for (const [name, queue] of queues) {
    await queue.close();
    logger.info(`Queue "${name}" closed`);
  }
  queues.clear();
};
