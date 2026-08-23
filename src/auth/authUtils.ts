import JWT, { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "../helper/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { AuthFailureError } from "../core/error.response";
import keyTokenServices from "../services/keyToken.services";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export interface AuthKeyStore {
  userId: string;
  publicKey: string;
  privateKey: string;
  refreshToken: string;
  refreshTokensUsed: string[];
}

export interface AuthContext {
  token: string;
  tokenType: "access" | "refresh";
  payload: TokenPayload;
  userId: string;
  keyStore: AuthKeyStore;
}

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-refresh-token",
};

const createTokenPair = async (
  payload: TokenPayload,
  publicKey: string,
  privateKey: string,
): Promise<TokenPair> => {
  // Using HS256 with symmetric key (same key for signing and verification)
  const accessToken = JWT.sign(payload, publicKey, {
    expiresIn: "2 days",
    algorithm: "HS256",
  });
  const refreshToken = JWT.sign(payload, privateKey, {
    expiresIn: "7 days",
    algorithm: "HS256",
  });

  return { accessToken, refreshToken };
};

const getHeaderValue = (value: string | string[] | undefined) => {
  const header = Array.isArray(value) ? value[0] : value;
  if (!header) return undefined;
  return /^Bearer\s+/i.test(header)
    ? header.replace(/^Bearer\s+/i, "")
    : header;
};

const authentication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    /*
      1 - Check userId missing???
      2 - get accessToken
      3 - verifyToken
      4 - check user in bds?
      5 - check keyStore with this userid?
      6 - OK all => return next ()
    */

    // 1
    const userId = getHeaderValue(req.headers[HEADER.CLIENT_ID]);
    if (!userId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    // 2
    const keyStore = await keyTokenServices.findByUserId(userId);
    if (!keyStore) {
      throw new AuthFailureError("Invalid Request: Key store not found");
    }

    // 3
    const refreshToken = getHeaderValue(req.headers[HEADER.REFRESH_TOKEN]);
    const accessToken = getHeaderValue(req.headers[HEADER.AUTHORIZATION]);
    const tokenType = refreshToken ? "refresh" : "access";
    const token = refreshToken ?? accessToken;
    if (!token) {
      throw new AuthFailureError(
        tokenType === "refresh"
          ? "Invalid Request: Missing refresh token"
          : "Invalid Request: Missing access token",
      );
    }

    const secret =
      tokenType === "refresh" ? keyStore.privateKey : keyStore.publicKey;
    let payload: TokenPayload;
    try {
      payload = await verifyJWT(token, secret);
    } catch {
      throw new AuthFailureError(
        tokenType === "refresh"
          ? "Invalid Request: Refresh token verification failed"
          : "Invalid Request: Access token verification failed",
      );
    }

    if (payload.userId !== userId) {
      throw new AuthFailureError("Invalid Request: User ID mismatch");
    }

    const authKeyStore: AuthKeyStore = {
      userId,
      publicKey: keyStore.publicKey,
      privateKey: keyStore.privateKey,
      refreshToken: keyStore.refreshToken,
      refreshTokensUsed: keyStore.refreshTokensUsed,
    };
    req.auth = { token, tokenType, payload, userId, keyStore: authKeyStore };
    req.keyStore = payload;
    req.refreshToken = tokenType === "refresh" ? token : undefined;
    return next();
  },
);

const verifyJWT = async (
  token: string,
  keySecret: string,
): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, keySecret, { algorithms: ["HS256"] }, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as TokenPayload);
    });
  });
};

export { createTokenPair, authentication, verifyJWT };
