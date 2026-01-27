'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const keyTokenServices = require("./keyToken.services");
const { createTokenPair } = require("../auth/authUtils");

const ROLE_SHOP = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    signUp = async ({ email, password, name }) => {
        try {
            // step 1: check email exist
            const holder = await shopModel.findOne({ email: email }).lean();
            if (holder) {
                return {
                    code: 'xxx',
                    message: "Email already exists",
                    status: 'error'
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({ email, password: hashedPassword, name, roles: [ROLE_SHOP.SHOP] });

            if (newShop) {
                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                const keyStore = await keyTokenServices.createKeyToken({ 
                    userId: newShop._id, 
                    publicKey,
                    privateKey 
                });

                if (!keyStore) {
                    return {
                        code: 'xxx',
                        message: "Error creating public key",
                        status: 'error'
                    }
                }

                // create token pair
                const token = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);
                return {
                    code: 201,
                    metadata: {
                        shop: newShop,
                        token: token
                    }
                }
            }

        } catch (error) {
            console.log("🚀 ~ AccessService ~ error:", error)
            return {
                code: 'xxx',
                message: "error",
                status: 'error'
            }
        }
    }
}

module.exports = new AccessService(); 