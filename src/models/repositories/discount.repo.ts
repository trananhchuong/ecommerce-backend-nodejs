import type { QueryFilter } from "mongoose";
import discountModel, { IDiscount } from "../discount.model";
import { getSelectData, unGetSelectData } from "../../utils";

const findAllDiscountCodesByShop = async ({
  query,
  limit,
  skip,
  sort,
  select,
}: {
  query: QueryFilter<IDiscount>;
  limit: number;
  skip: number;
  sort: "ctime" | "oldest";
  select: string[];
}) => {
  const sortDirection = sort === "ctime" ? -1 : 1;

  return discountModel
    .find(query)
    .select(select.length > 0 ? getSelectData(select) : "-discount_users_used")
    .sort({ updatedAt: sortDirection, _id: sortDirection })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const countDiscountCodesByShop = (query: QueryFilter<IDiscount>) =>
  discountModel.countDocuments(query).exec();

const findDiscountByShopAndCode = (shopId: string, code: string) =>
  discountModel
    .findOne({ discount_shopId: shopId, discount_code: code })
    .lean()
    .exec();

const findAllDiscountCodesUnSelect = async ({
  limit = 50,
  page = 1,
  sort,
  filter,
  unSelect = [],
}: {
  limit: number;
  page: number;
  sort: "ctime" | "oldest";
  filter: QueryFilter<IDiscount>;
  unSelect: string[];
}) => {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Number(limit)) : 50;
  const safePage = Number.isFinite(page) ? Math.max(1, Number(page)) : 1;
  const skip = (safePage - 1) * safeLimit;
  const sortBy: Record<string, 1 | -1> =
    sort === "ctime" ? { updatedAt: -1 } : { updatedAt: 1 };

  return discountModel
    .find(filter)
    .select(unGetSelectData(unSelect))
    .sort(sortBy)
    .skip(skip)
    .limit(safeLimit)
    .lean()
    .exec();
};

const findAllDiscountCodesSelect = async ({
  limit = 50,
  page = 1,
  sort,
  filter,
  select = [],
}: {
  limit: number;
  page: number;
  sort: "ctime" | "oldest";
  filter: QueryFilter<IDiscount>;
  select: string[];
}) => {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Number(limit)) : 50;
  const safePage = Number.isFinite(page) ? Math.max(1, Number(page)) : 1;
  const skip = (safePage - 1) * safeLimit;
  const sortBy: Record<string, 1 | -1> =
    sort === "ctime" ? { updatedAt: -1 } : { updatedAt: 1 };

  return discountModel
    .find(filter)
    .select(getSelectData(select))
    .sort(sortBy)
    .skip(skip)
    .limit(safeLimit)
    .lean()
    .exec();
};

const checkDiscountExists = async (filter: QueryFilter<IDiscount>) => {
  return await discountModel.findOne(filter).lean();
};

export {
  countDiscountCodesByShop,
  findAllDiscountCodesByShop,
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect,
  findDiscountByShopAndCode,
  checkDiscountExists,
};
