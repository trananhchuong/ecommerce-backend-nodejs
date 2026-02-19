"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const accessServices = require("../services/access.services");

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await accessServices.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    new CREATED({
      message: "Sign up successfully",
      metadata: await accessServices.signUp(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
