import type { QueryFilter } from "mongoose";
import discountModel, { IDiscount } from "../discount.model";
import { getSelectData } from "../../utils";

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

export { countDiscountCodesByShop, findAllDiscountCodesByShop };