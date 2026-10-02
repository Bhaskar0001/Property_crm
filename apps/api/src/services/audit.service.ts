import { AuditLogModel } from '../models/AuditLog';
import { logger } from '../utils/logger';

export class AuditService {
  async log(params: {
    userId: string;
    userName: string;
    action: string;
    entity: string;
    entityId: string;
    ip?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await AuditLogModel.create({
        user: params.userId,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        ip: params.ip,
        before: params.before,
        after: params.after,
      });
    } catch (error) {
      // Audit logging should never crash the application
      logger.error({ err: error }, 'Failed to create audit log');
    }
  }

  async getAll(params: {
    page: number;
    limit: number;
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page, limit, userId, entity, entityId, action, startDate, endDate } = params;
    const filter: any = {};

    if (userId) filter.user = userId;
    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = entityId;
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email')
        .lean(),
      AuditLogModel.countDocuments(filter),
    ]);

    return { logs, total };
  }
}

export const auditService = new AuditService();
