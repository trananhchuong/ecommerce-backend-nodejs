"use strict";

import keyTokenModel from "../models/keyToken.model";

interface CreateKeyTokenParams {
  userId: string;
  publicKey: string;
  privateKey: string;
  refreshToken?: string;
}

class KeyTokenService {
  createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }: CreateKeyTokenParams) => {
    try {
      // publicKey and privateKey are already PEM strings
      // const keyToken = await keyTokenModel.create({
      //     user: userId,
      //     publicKey,
      //     privateKey
      // });
      // return keyToken ? keyToken.publicKey : null;

      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  findByUserId = async (userId: string) => {
    return await keyTokenModel.findOne({ user: userId });
  };

  deleteKeyToken = async (refreshToken: string) => {
    return await keyTokenModel.deleteOne({ refreshToken });
  };
}

export default new KeyTokenService();
