"use strict";

const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
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
}

module.exports = new KeyTokenService();
