import { NextFunction, Request, RequestHandler, Response } from "express";

const asyncHandler = (func: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };
};

export { asyncHandler };
