import type { QueryFilter } from "mongoose";
import productModel, { IProduct } from "../product.model";
import { getSelectData } from "../../utils";

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

const findAllProducts = async ({
  limit = 50,
  sort = "ctime",
  page = 1,
  filter = {},
  select = [],
}: {
  limit?: number;
  sort?: "ctime" | "oldest";
  page?: number;
  filter?: QueryFilter<IProduct>;
  select?: string[];
}) => {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Number(limit)) : 50;
  const safePage = Number.isFinite(page) ? Math.max(1, Number(page)) : 1;
  const skip = (safePage - 1) * safeLimit;
  const sortBy: Record<string, 1 | -1> =
    sort === "ctime" ? { updatedAt: -1 } : { updatedAt: 1 };


  return (
    productModel
      .find(filter)
      .select(getSelectData(select))
      .populate("product_shop", "name email -_id")
      .sort(sortBy)
      .skip(skip)
      .limit(safeLimit)
      .lean()
      .exec()
  );
};

const searchProductByPublic = async ({
  keySearch,
  limit,
  skip,
}: {
  keySearch: string;
  limit: number;
  skip: number;
}) => {
  return productModel
    .find({
      isPublished: true,
      $text: { $search: keySearch },
    })
    .select("+isDraft +isPublished")
    .populate("product_shop", "name email -_id")
    .sort({ score: { $meta: "textScore" }, updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const findProductById = async ({ product_id }: { product_id: string }) => {
  return productModel
    .findById(product_id)
    .select(
      getSelectData([
        "product_name",
        "product_thumb",
        "product_price",
        "product_description",
      ]),
    )
    .populate("product_shop", "name email -_id")
    .lean()
    .exec();
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

const updateProductById = async ({
  product_id,
  bodyUpdate,
  product_shop,
}: {
  product_id: string;
  bodyUpdate: Record<string, unknown>;
  product_shop: string;
}) => {
  // Remove undefined fields to perform partial update
  const updatePayload = Object.fromEntries(
    Object.entries(bodyUpdate).filter(([, value]) => value !== undefined),
  );

  return productModel
    .findOneAndUpdate(
      { _id: product_id, product_shop },
      { $set: updatePayload },
      { new: true },
    )
    .populate("product_shop", "name email -_id")
    .lean()
    .exec();
};

export {
  findAllDraftsForShop,
  findAllProducts,
  findAllPublishForShop,
  findProductById,
  publishProductByShop,
  queryProduct,
  searchProductByPublic,
  unPublishProductByShop,
  updateProductById,
};
export type { QueryProductParams };
