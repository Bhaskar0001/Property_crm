import { Worker } from 'bullmq';
import { getRedis, isRedisAvailable } from '../config/redis';
import { QUEUE_NAMES } from '../config/queue';
import { logger } from '../utils/logger';
import { processEmailJob } from './workers/email.worker';
import { processWhatsAppJob } from './workers/whatsapp.worker';
import { processNotificationJob } from './workers/notification.worker';
import { processImageJob } from './workers/image.worker';
import { processCurrencyJob } from './workers/currency.worker';
import { processImportJob } from './workers/import.worker';

const workers: Worker[] = [];

function createWorker(queueName: string, processor: (job: any) => Promise<any>): Worker | null {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const worker = new Worker(queueName, processor, {
      connection: redis.duplicate(),
      concurrency: queueName === QUEUE_NAMES.IMAGE_PROCESSING ? 2 : 5,
      limiter: queueName === QUEUE_NAMES.WHATSAPP ? { max: 30, duration: 1000 } : undefined,
    });

    worker.on('completed', (job) => {
      logger.debug(`Job ${job.id} in queue "${queueName}" completed`);
    });

    worker.on('failed', (job, err) => {
      logger.error({ err, jobId: job?.id }, `Job failed in queue "${queueName}"`);
    });

    workers.push(worker);
    logger.info(`Worker for queue "${queueName}" started`);
    return worker;
  } catch (err: any) {
    logger.warn(`Failed to create worker for "${queueName}": ${err.message}`);
    return null;
  }
}

export function initializeWorkers(): void {
  if (!isRedisAvailable()) {
    logger.info('ℹ️ Redis is offline — BullMQ workers disabled.');
    return;
  }

  createWorker(QUEUE_NAMES.EMAIL, processEmailJob);
  createWorker(QUEUE_NAMES.WHATSAPP, processWhatsAppJob);
  createWorker(QUEUE_NAMES.NOTIFICATION, processNotificationJob);
  createWorker(QUEUE_NAMES.IMAGE_PROCESSING, processImageJob);
  createWorker(QUEUE_NAMES.CURRENCY_REFRESH, processCurrencyJob);
  createWorker(QUEUE_NAMES.IMPORT, processImportJob);

  logger.info('All BullMQ workers initialized');
}

export async function closeAllWorkers(): Promise<void> {
  for (const worker of workers) {
    try {
      await worker.close();
    } catch {
      // ignore
    }
  }
  workers.length = 0;
}
