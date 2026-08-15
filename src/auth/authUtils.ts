"use strict";

import JWT from "jsonwebtoken";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const createTokenPair = async (
  payload: object,
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

export { createTokenPair };
