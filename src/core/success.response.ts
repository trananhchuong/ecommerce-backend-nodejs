import { Response } from "express";
import { StatusCodes } from "../utils/httpStatusCode";

const REASON_PHRASE = {
  OK: "OK",
  CREATED: "Created",
};

interface SuccessResponseParams {
  statusCode?: number;
  message?: string;
  reasonStatusCode?: string;
  metadata?: any;
}

class SuccessResponse {
  status: number;
  metadata: any;
  message: string;

  constructor({
    statusCode = StatusCodes.OK,
    message,
    reasonStatusCode = REASON_PHRASE.OK,
    metadata = {},
  }: SuccessResponseParams) {
    this.status = statusCode;
    this.metadata = metadata;
    this.message = message || reasonStatusCode;
  }

  send(res: Response, headers: Record<string, string> = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }: SuccessResponseParams) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    metadata,
  }: SuccessResponseParams) {
    super({ message, statusCode, metadata });
  }
}

export { CREATED, OK, SuccessResponse };
