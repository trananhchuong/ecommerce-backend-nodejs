import { IApikey } from "../models/apikey.model";

declare global {
  namespace Express {
    interface Request {
      objKey?: IApikey;
    }
  }
}

export {};
