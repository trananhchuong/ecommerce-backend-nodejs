'use strict';

const { ForbiddenError } = require('../core/error.respone');
const { findById } = require('../services/apikey.services');
const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        if (!key) {
            throw new ForbiddenError('Error: Forbidden Error');
        }
        // check objKey
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: 'Forbidden Error'
            });
        }

        req.objKey = objKey;
        return next();
    } catch (error) {
        return res.status(403).json({
            message: error.message
        });
    }
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: 'Permission denied'
            });
        }
        const validPermission = req.objKey.permissions.includes(permission);
        if (!validPermission) {
            return res.status(403).json({
                message: 'Permission denied'
            });
        }
        return next();
    }
}

const asyncHandler = (func) => {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch(next);
    }
}

module.exports = {
    apiKey,
    permission,
    asyncHandler
}