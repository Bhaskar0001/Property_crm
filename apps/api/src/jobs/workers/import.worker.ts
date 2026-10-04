import { Job } from 'bullmq';
import { importService, ImportResult } from '../../services/import.service';
import { notificationService } from '../../services/notification.service';
import { logger } from '../../utils/logger';

export interface ImportJobData {
  type: 'properties' | 'leads';
  rows: any[];
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export async function processImportJob(job: Job<ImportJobData>): Promise<ImportResult> {
  const { data } = job;
  logger.info({ jobId: job.id, type: data.type, rowCount: data.rows?.length }, 'Processing import job');

  try {
    let result: ImportResult;
    if (data.type === 'properties') {
      result = await importService.importProperties(data.rows, data.user);
    } else {
      result = await importService.importLeads(data.rows, data.user);
    }

    if (data.user?._id) {
      await notificationService.notifyUser(data.user._id, {
        title: `Import Completed: ${data.type}`,
        message: `Imported ${result.created} rows (${result.skipped} skipped, total ${result.total})`,
        type: 'SYSTEM',
        metadata: { importType: data.type, result },
      });
    }

    return result;
  } catch (error: any) {
    logger.error({ jobId: job.id, err: error }, 'Failed to process import job');
    if (data.user?._id) {
      await notificationService.notifyUser(data.user._id, {
        title: `Import Failed: ${data.type}`,
        message: `Import failed: ${error.message}`,
        type: 'SYSTEM',
      });
    }
    throw error;
  }
}
