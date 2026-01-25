'use strict';

const JWT = require('jsonwebtoken');

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // Using HS256 with symmetric key (same key for signing and verification)
        const accessToken = await JWT.sign(payload, publicKey, { expiresIn: '2 days' });
        const refreshToken = await JWT.sign(payload, privateKey, { expiresIn: '7 days' });

        // For HS256, use the same key (privateKey) for verification
        JWT.verify(accessToken, privateKey, (err, decoded) => {
            if (err) {
                console.log('Error verifying access token:', err);
            } else {
                console.log('Access token verified:', decoded);
            }
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Error creating token pair:', error);
        return null;
    }
}

module.exports = {
    createTokenPair
}