import { Job } from 'bullmq';
import { currencyService } from '../../services/currency.service';
import { logger } from '../../utils/logger';

export interface CurrencyJobData {
  baseCurrency?: string;
}

export async function processCurrencyJob(job: Job<CurrencyJobData>): Promise<any> {
  const baseCurrency = job.data?.baseCurrency || 'EUR';
  logger.info({ jobId: job.id, baseCurrency }, 'Processing currency refresh job');

  try {
    const rates = await currencyService.refreshRates(baseCurrency);
    logger.info({ count: Object.keys(rates).length }, 'Currency exchange rates successfully refreshed');
    return { success: true, ratesCount: Object.keys(rates).length };
  } catch (error: any) {
    logger.error({ jobId: job.id, err: error }, 'Failed to refresh currency rates');
    throw error;
  }
}
