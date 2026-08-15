"use strict";

import apiKeyModel, { IApikey } from "../models/apikey.model";

const findById = async (key: string): Promise<IApikey | null> => {
  const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
  return objKey as IApikey | null;
};

export { findById };
