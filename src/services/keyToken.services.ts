import { Types } from "mongoose";
import keyTokenModel from "../models/keyToken.model";

interface CreateKeyTokenParams {
  userId: string;
  publicKey: string;
  privateKey: string;
  refreshToken?: string;
}

interface RotateRefreshTokenParams {
  oldRefreshToken: string;
  newRefreshToken: string;
}

class KeyTokenService {
  createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }: CreateKeyTokenParams) => {
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
  };

  findByUserId = async (userId: string) => {
    return await keyTokenModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();
  };

  removeKeyById = async (userId: string) => {
    return await keyTokenModel.findOneAndDelete({
      user: new Types.ObjectId(userId),
    });
  };

  findByRefreshTokenUsed = async (refreshToken: string) => {
    return await keyTokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };

  findByRefreshToken = async (refreshToken: string) => {
    return await keyTokenModel.findOne({ refreshToken }).lean();
  };

  rotateRefreshToken = async ({
    oldRefreshToken,
    newRefreshToken,
  }: RotateRefreshTokenParams) => {
    return await keyTokenModel.findOneAndUpdate(
      { refreshToken: oldRefreshToken },
      {
        $set: { refreshToken: newRefreshToken },
        $addToSet: { refreshTokensUsed: oldRefreshToken },
      },
      { new: true },
    );
  };


}

export default new KeyTokenService();
