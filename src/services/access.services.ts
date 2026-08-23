import shopModel from "../models/shop.model";
import bcrypt from "bcrypt";
import crypto from "crypto";
import keyTokenServices from "./keyToken.services";
import { AuthContext, createTokenPair } from "../auth/authUtils";
import {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} from "../core/error.response";
import { findByEmail } from "./shop.services";
import { getInfoData } from "../utils";
import StatusCodes from "../utils/statusCodes";

const ROLE_SHOP = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

interface LoginParams {
  email: string;
  password: string;
  refreshToken?: string | null;
}

interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

class AccessService {
  /*
        step 1: check email exist
        step 2: match password
        step 3: create Access Token and Refresh Token and save to database
        step 4: generate token pair.
        step 5: return token pair.
    */

  login = async ({ email, password, refreshToken = null }: LoginParams) => {
    // step 1: check email exist
    const shop = await findByEmail({ email });
    if (!shop) {
      throw new BadRequestError("Error: Shop not registered");
    }

    // step 2: match password
    const isMatch = await bcrypt.compare(password, shop.password);

    if (!isMatch) throw new AuthFailureError("Error: Invalid password");

    // step 3: create Access Token and Refresh Token and save to database
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // step 4: generate token pair.
    const tokens = await createTokenPair(
      { userId: shop._id.toString(), email },
      publicKey,
      privateKey,
    );

    await keyTokenServices.createKeyToken({
      refreshToken: tokens?.refreshToken as string,
      publicKey,
      privateKey,
      userId: shop._id.toString(),
    });

    // step 5: return token pair.
    return {
      shop: getInfoData({ fields: ["_id", "name", "email"], object: shop }),
      tokens,
    };
  };

  signUp = async ({ email, password, name }: SignUpParams) => {
    // step 1: check email exist
    const holder = await shopModel.findOne({ email: email }).lean();
    if (holder) {
      throw new BadRequestError("Error: Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      email,
      password: hashedPassword,
      name,
      roles: [ROLE_SHOP.SHOP],
    });

    if (newShop) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const tokens = await createTokenPair(
        { userId: newShop._id.toString(), email },
        publicKey,
        privateKey,
      );
      const keyStore = await keyTokenServices.createKeyToken({
        userId: newShop._id.toString(),
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Error creating public key");
      }
      return {
        code: StatusCodes.CREATED,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
  };

  logout = async (userId: string) => {
    return await keyTokenServices.removeKeyById(userId);
  };

  handleRefreshToken = async ({
    auth,
  }: {
    auth: AuthContext;
  }) => {
    const { keyStore, payload, token: refreshToken } = auth;
    const foundTokenUsed =
      await keyTokenServices.findByRefreshTokenUsed(refreshToken);
    if (foundTokenUsed) {
      await keyTokenServices.removeKeyById(foundTokenUsed.user.toString());
      throw new ForbiddenError("Error: Refresh token has been used");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new ForbiddenError("Error: Refresh token does not match");
    }

    const { userId, email } = payload;

    const shop = await findByEmail({ email });
    if (!shop) {
      throw new AuthFailureError("Error: Shop not found");
    }

    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey,
    );

    await keyTokenServices.rotateRefreshToken({
      oldRefreshToken: refreshToken,
      newRefreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({ fields: ["_id", "name", "email"], object: shop }),
      tokens,
    };
  };
}

export default new AccessService();
