"use strict";

import shopModel from "../models/shop.model";

const findByEmail = async ({ email }: { email: string }) => {
  return await shopModel.findOne({ email: email }).lean();
};

export { findByEmail };
