'use strict';

const accessServices = require("../services/access.services");

class AccessController {
    signUp = async (req, res, next) => {
        return res.status(201).json(await accessServices.signUp(req.body));
    }
}

module.exports = new AccessController();