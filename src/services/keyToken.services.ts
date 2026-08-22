import { Types } from "mongoose";
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
    return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
  };

  removeKeyById = async (userId: string) => {
    return await keyTokenModel.findOneAndDelete({ user: new Types.ObjectId(userId) });
  };
}

export default new KeyTokenService();
