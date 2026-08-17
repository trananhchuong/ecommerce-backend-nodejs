import { IApikey } from "../models/apikey.model";
import { TokenPayload } from "../auth/authUtils";

declare global {
  namespace Express {
    interface Request {
      objKey?: IApikey;
      keyStore?: TokenPayload;
    }
  }
}

export {};
