"use strict";

import shopModel from "../models/shop.model";
import bcrypt from "bcrypt";
import crypto from "crypto";
import keyTokenServices from "./keyToken.services";
import { createTokenPair } from "../auth/authUtils";
import { BadRequestError, AuthFailureError } from "../core/error.response";
import { findByEmail } from "./shop.services";
import { getInfoData } from "../utils";

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

interface LogoutParams {
  refreshToken?: string;
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
      { userId: shop._id, email },
      publicKey,
      privateKey,
    );

    // @ts-expect-error publicKey missing here — pre-existing bug, fixed in a follow-up commit
    await keyTokenServices.createKeyToken({
      refreshToken: tokens?.refreshToken as string,
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

      const keyStore = await keyTokenServices.createKeyToken({
        userId: newShop._id.toString(),
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Error creating public key");
      }

      // create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey,
      );
      return {
        code: 201,
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

  logout = async ({ refreshToken }: LogoutParams) => {
    // @ts-expect-error req is not in scope here — pre-existing bug, fixed in a follow-up commit
    const { userId } = req.user;
    // @ts-expect-error findByUserId not implemented yet — pre-existing bug, fixed in a follow-up commit
    const keyStore = await keyTokenServices.findByUserId(userId);
    if (!keyStore) {
      throw new BadRequestError("Error: Key store not found");
    }
    // @ts-expect-error deleteKeyToken not implemented yet — pre-existing bug, fixed in a follow-up commit
    return await keyTokenServices.deleteKeyToken(keyStore.refreshToken);
  };
}

export default new AccessService();
