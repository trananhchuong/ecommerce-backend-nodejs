'use strict';

const accessServices = require("../services/access.services");

class AccessController {
    signUp = async (req, res, next) => {
        try {
            return res.status(201).json(await accessServices.signUp(req.body));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AccessController();