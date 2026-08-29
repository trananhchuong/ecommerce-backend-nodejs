import type { QueryFilter } from "mongoose";
import productModel, { IProduct } from "../product.model";

type QueryProductParams = {
  query: QueryFilter<IProduct>;
  limit: number;
  skip: number;
};

const queryProduct = async ({ query, limit, skip }: QueryProductParams) => {
  return productModel
    .find(query)
    .select("+isDraft +isPublished")
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const findAllDraftsForShop = async ({
  query,
  limit,
  skip,
}: QueryProductParams) => {
  return queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({
  query,
  limit,
  skip,
}: QueryProductParams) => {
  return queryProduct({ query, limit, skip });
};

const publishProductByShop = async ({
  product_shop,
  product_id,
}: {
  product_shop: string;
  product_id: string;
}) => {
  return productModel
    .findOneAndUpdate(
      { _id: product_id, product_shop },
      {
        $set: { isDraft: false, isPublished: true },
      },
      { new: true },
    )
    .select("+isDraft +isPublished")
    .populate("product_shop", "name email -_id")
    .lean()
    .exec();
};

const unPublishProductByShop = async ({
  product_shop,
  product_id,
}: {
  product_shop: string;
  product_id: string;
}) => {
  return productModel
    .findOneAndUpdate(
      { _id: product_id, product_shop },
      {
        $set: { isDraft: true, isPublished: false },
      },
      { new: true },
    )
    .select("+isDraft +isPublished")
    .populate("product_shop", "name email -_id")
    .lean()
    .exec();
};

export {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  queryProduct,
  unPublishProductByShop,
};
export type { QueryProductParams };
