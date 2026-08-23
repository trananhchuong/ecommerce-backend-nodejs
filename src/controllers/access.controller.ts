import { Request, Response, NextFunction } from "express";
import { CREATED, SuccessResponse } from "../core/success.response";
import accessServices from "../services/access.services";

class AccessController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    new SuccessResponse({
      metadata: await accessServices.login(req.body),
    }).send(res);
  };

  signUp = async (req: Request, res: Response, next: NextFunction) => {
    new CREATED({
      message: "Sign up successfully",
      metadata: await accessServices.signUp(req.body),
    }).send(res);
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    new SuccessResponse({
      message: "Logout successfully",
      metadata: await accessServices.logout(req.auth?.userId as string),
    }).send(res);
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    new SuccessResponse({
      message: "Get new token successfully",
      metadata: await accessServices.handleRefreshToken({
        auth: req.auth as NonNullable<Request["auth"]>,
      }),
    }).send(res);
  };
}

export default new AccessController();
