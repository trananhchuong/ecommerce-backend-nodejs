'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const keyTokenServices = require("./keyToken.services");
const { createTokenPair } = require("../auth/authUtils");
const { BadRequestError } = require("../core/error.respone");

const ROLE_SHOP = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    signUp = async ({ email, password, name }) => {
        // step 1: check email exist
        const holder = await shopModel.findOne({ email: email }).lean();
        if (holder) {
            throw new BadRequestError('Error: Email already exists');
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
                throw new BadRequestError('Error: Error creating public key');
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
    }
}

module.exports = new AccessService(); 