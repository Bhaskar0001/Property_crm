import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendCreated = <T>(res: Response, data: T, message?: string) => {
  return sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};
