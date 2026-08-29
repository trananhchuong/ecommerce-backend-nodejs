import type { QueryFilter } from "mongoose";
import productModel, { IProduct } from "../product.model";

type FindAllDraftsForShopParams = {
  query: QueryFilter<IProduct>;
  limit: number;
  skip: number;
};

const findAllDraftsForShop = async ({
  query,
  limit,
  skip,
}: FindAllDraftsForShopParams) => {
  return productModel
    .find(query)
    .select("+isDraft")
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

export { findAllDraftsForShop };
export type { FindAllDraftsForShopParams };
