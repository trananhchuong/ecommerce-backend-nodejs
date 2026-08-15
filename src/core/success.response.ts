"use strict";

const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
};

const REASON_PHRASE = {
  OK: "OK",
  CREATED: "Created",
};

class SuccessResponse {
  constructor({
    statusCode = STATUS_CODE.OK,
    message,
    reasonStatusCode = REASON_PHRASE.OK,
    metadata = {},
  }) {
    this.status = statusCode;
    this.metadata = metadata;
    this.message = message || reasonStatusCode;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({ message, statusCode = STATUS_CODE.CREATED, metadata }) {
    super({ message, statusCode, metadata });
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
