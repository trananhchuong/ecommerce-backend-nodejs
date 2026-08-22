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

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};


const createTokenPair = async (
  payload: TokenPayload,
  publicKey: string,
  privateKey: string,
): Promise<TokenPair> => {
  // Using HS256 with symmetric key (same key for signing and verification)
  const accessToken = JWT.sign(payload, publicKey, { expiresIn: "2 days" });
  const refreshToken = JWT.sign(payload, privateKey, { expiresIn: "7 days" });

  // For HS256, use the same key (publicKey) for verification
  JWT.verify(accessToken, publicKey, (err, decoded) => {
    if (err) {
      console.log("Error verifying access token:", err);
    } else {
      console.log("Access token verified:", decoded);
    }
  });

  return { accessToken, refreshToken };
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
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    // 2
    const keyStore = await keyTokenServices.findByUserId(userId.toString());
    if (!keyStore) {
      throw new AuthFailureError("Invalid Request: Key store not found");
    }

    // 3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) {
      throw new AuthFailureError("Invalid Request: Missing access token");
    }
    const token = Array.isArray(accessToken) ? accessToken[0] : accessToken;

    try {
      const decoded = JWT.verify(token, keyStore.publicKey) as TokenPayload;

      if (decoded.userId !== userId) {
        throw new AuthFailureError("Invalid Request: User ID mismatch");
      }

      req.keyStore = decoded; // Attach the decoded payload to the request object

      return next();
    } catch (err) {
      throw new AuthFailureError("Invalid Request: Access token verification failed");
    }

  },
);

const verifyJWT = async (token: string, keySecret: string): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, keySecret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as TokenPayload);
    });
  });
}

export { createTokenPair, authentication, verifyJWT };
