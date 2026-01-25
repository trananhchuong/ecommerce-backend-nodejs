'use strict';

const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
    createKeyToken = async ({ userId, publicKey, privateKey }) => {
        try {
            // publicKey and privateKey are already PEM strings
            const keyToken = await keyTokenModel.create({
                user: userId,
                publicKey,
                privateKey
            });
            return keyToken ? keyToken.publicKey : null;
        } catch (error) {
            return error;
        }
    }
}

module.exports = new KeyTokenService(); 