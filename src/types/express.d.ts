import { IApikey } from "../models/apikey.model";
import { AuthContext, TokenPayload } from "../auth/authUtils";

declare global {
  namespace Express {
    interface Request {
      objKey?: IApikey;
      auth?: AuthContext;
      keyStore?: TokenPayload;
      refreshToken?: string;
    }
  }
}

export {};
