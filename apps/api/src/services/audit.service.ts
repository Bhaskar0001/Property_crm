import { Request } from 'express';
import { AuditLogModel } from '../models/AuditLog';
import { logger } from '../utils/logger';

export interface AuditLogParams {
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId: string;
  ip?: string;
  userAgent?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export class AuditService {
  async log(params: AuditLogParams): Promise<void> {
    try {
      await AuditLogModel.create({
        user: params.userId || undefined,
        userName: params.userName || 'System',
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        ip: params.ip,
        userAgent: params.userAgent,
        before: params.before,
        after: params.after,
      });
    } catch (error) {
      // Audit logging should never crash the application
      logger.error({ err: error }, 'Failed to create audit log');
    }
  }

  /**
   * Helper to log directly using Express Request context
   */
  async logFromReq(
    req: Request,
    action: string,
    entity: string,
    entityId: string,
    before?: Record<string, unknown> | null,
    after?: Record<string, unknown> | null
  ): Promise<void> {
    const user = (req as any).user;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await this.log({
      userId: user?._id?.toString() || user?.id,
      userName: user?.name || user?.email || 'Anonymous',
      action,
      entity,
      entityId,
      ip,
      userAgent,
      before,
      after,
    });
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
