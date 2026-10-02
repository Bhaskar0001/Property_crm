import { Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service';
import { AuthRequest } from '../middlewares/auth';
import { UnauthorizedError } from '../utils/errors';

export class LeadController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, stage, source, priority, assignedTo, page, limit } = req.query;

      const result = await leadService.list(
        {
          search: search ? String(search) : undefined,
          stage: stage ? String(stage) : undefined,
          source: source ? String(source) : undefined,
          priority: priority ? String(priority) : undefined,
          assignedTo: assignedTo ? String(assignedTo) : undefined,
          page: page ? Number(page) : 1,
          limit: limit !== undefined ? Number(limit) : 50,
        },
        req.user
      );

      res.status(200).json({
        success: true,
        data: result.leads,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await leadService.getById(id, req.user);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const lead = await leadService.create(req.body, req.user._id.toString());
      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const { id } = req.params;
      const updated = await leadService.update(id, req.body, req.user._id.toString());
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async changeStage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const { id } = req.params;
      const { stageId } = req.body;
      const updated = await leadService.changeStage(id, stageId, req.user._id.toString());
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async assign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const { id } = req.params;
      const { staffId } = req.body;
      const updated = await leadService.assignLead(id, staffId, req.user._id.toString());
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async addNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const { id } = req.params;
      const { description } = req.body;
      const note = await leadService.addNote(id, description, req.user._id.toString());
      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  async matchProperties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const matched = await leadService.matchProperties(id);
      res.status(200).json({
        success: true,
        data: matched,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const { id } = req.params;
      const task = await leadService.createTask(id, req.body, req.user._id.toString());
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTaskStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) throw new UnauthorizedError();
      const { taskId } = req.params;
      const { status } = req.body;
      const task = await leadService.updateTaskStatus(taskId, status, req.user._id.toString());
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const leadController = new LeadController();
