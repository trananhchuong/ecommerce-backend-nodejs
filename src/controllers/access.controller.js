'use strict';

const { CREATED } = require("../core/success.response");
const accessServices = require("../services/access.services");

class AccessController {
    signUp = async (req, res, next) => {
        new CREATED({
            message: 'Sign up successfully',
            metadata: await accessServices.signUp(req.body),
        }).send(res);
    }
}

module.exports = new AccessController();