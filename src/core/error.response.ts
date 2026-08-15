"use strict";

import { StatusCodes, ReasonPhrases } from "../utils/httpStatusCode";

class ErrorResponse extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.CONFLICT,
    statusCode: number = StatusCodes.CONFLICT,
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.BAD_REQUEST,
    statusCode: number = StatusCodes.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.NOT_FOUND,
    statusCode: number = StatusCodes.NOT_FOUND,
  ) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.FORBIDDEN,
    statusCode: number = StatusCodes.FORBIDDEN,
  ) {
    super(message, statusCode);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.UNAUTHORIZED,
    statusCode: number = StatusCodes.UNAUTHORIZED,
  ) {
    super(message, statusCode);
  }
}

export {
  ErrorResponse,
  ConflictRequestError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  AuthFailureError,
};
