'use strict';

const STATUS_CODE = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    BAD_REQUEST: 400,
    NOT_FOUND: 404
}

const REASON_PHRASE = {
    FORBIDDEN: 'Forbidden',
    CONFLICT: 'Conflict',
    BAD_REQUEST: 'Bad Request',
    NOT_FOUND: 'Not Found'
}

class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = REASON_PHRASE.CONFLICT, statusCode = STATUS_CODE.CONFLICT) {
        super(message, statusCode);
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = REASON_PHRASE.BAD_REQUEST, statusCode = STATUS_CODE.BAD_REQUEST) {
        super(message, statusCode);
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = REASON_PHRASE.NOT_FOUND, statusCode = STATUS_CODE.NOT_FOUND) {
        super(message, statusCode);
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(message = REASON_PHRASE.FORBIDDEN, statusCode = STATUS_CODE.FORBIDDEN) {
        super(message, statusCode);
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    NotFoundError,
    ForbiddenError
}