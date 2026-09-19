/*
Discount Services
- Generator Discount Code [Shop | Admin]
- Get discount amount [User]
- Get all discount codes [User | Shop]
- Verify discount code [User]
- Delete discount Code [Admin | Shop]
- Cancel discount code [User]
*/

import { BadRequestError, NotFoundError } from "../core/error.response";
import discountModel, { IDiscount } from "../models/discount.model";
import { findAllProducts } from "../models/repositories/product.repo";
import {
  checkDiscountExists,
  findAllDiscountCodesUnSelect,
} from "../models/repositories/discount.repo";
import { convertToObjectId } from "../utils";

type DiscountType = "fixed_amount" | "percentage";
type DiscountScope = "all" | "specific";

interface CreateDiscountPayload {
  name: string;
  description: string;
  code: string;
  discount_start_date: string | Date;
  discount_end_date: string | Date;
  max_uses: number;
  max_uses_per_user: number;
  min_order_value?: number;
  discount_type: DiscountType;
  discount_value: number;
  uses_count?: number;
  users_used?: string[];
  is_active?: boolean;
  applies_to: DiscountScope;
  product_ids?: string[];
}

interface UpdateDiscountPayload {
  name?: string;
  description?: string;
  code?: string;
  discount_start_date?: string | Date;
  discount_end_date?: string | Date;
  max_uses?: number;
  max_uses_per_user?: number;
  min_order_value?: number;
  discount_type?: DiscountType;
  discount_value?: number;
  is_active?: boolean;
  applies_to?: DiscountScope;
  product_ids?: string[];
}

type DiscountUpdateData = Partial<{
  discount_name: string;
  discount_description: string;
  discount_code: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_max_uses: number;
  discount_max_uses_per_user: number;
  discount_min_order_value: number;
  discount_is_active: boolean;
  discount_start_date: Date;
  discount_end_date: Date;
  discount_applies_to: DiscountScope;
  discount_product_ids: ReturnType<typeof convertToObjectId>[];
}>;

class DiscountService {
  async createDiscountCode(
    shopId: string,
    payload: CreateDiscountPayload,
  ): Promise<IDiscount> {
    const {
      name,
      description,
      code,
      discount_start_date,
      discount_end_date,
      max_uses,
      max_uses_per_user,
      min_order_value,
      discount_type,
      discount_value,
      uses_count = 0,
      users_used = [],
      is_active = true,
      applies_to,
      product_ids = [],
    } = payload;
    const startDate = new Date(discount_start_date);
    const endDate = new Date(discount_end_date);

    // Validate discount dates
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestError("Error: invalid discount dates");
    }
    if (startDate >= endDate) {
      throw new BadRequestError(
        "Error: discount_start_date must be before discount_end_date",
      );
    }

    const foundDiscountCode = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (foundDiscountCode) {
      throw new BadRequestError("Error: discount code already exists");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type,
      discount_code: code,
      discount_value,
      discount_min_order_value: min_order_value || 0,
      discount_start_date: startDate,
      discount_end_date: endDate,
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used.map(convertToObjectId),
      discount_shopId: convertToObjectId(shopId),
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids:
        applies_to === "all" ? [] : product_ids.map(convertToObjectId),
    });

    return newDiscount;
  }

  async updateDiscountCode(
    shopId: string,
    discountId: string,
    payload: UpdateDiscountPayload,
  ): Promise<IDiscount | null> {
    const discountObjectId = convertToObjectId(discountId);
    const shopObjectId = convertToObjectId(shopId);
    const discount = await discountModel.findOne({
      _id: discountObjectId,
      discount_shopId: shopObjectId,
    });

    if (!discount) {
      throw new NotFoundError("Error: discount code not found");
    }

    if (payload.code !== undefined) {
      const foundDiscountCode = await discountModel
        .findOne({
          _id: { $ne: discountObjectId },
          discount_code: payload.code,
          discount_shopId: shopObjectId,
        })
        .lean();

      if (foundDiscountCode) {
        throw new BadRequestError("Error: discount code already exists");
      }
    }

    const startDate =
      payload.discount_start_date !== undefined
        ? new Date(payload.discount_start_date)
        : discount.discount_start_date;
    const endDate =
      payload.discount_end_date !== undefined
        ? new Date(payload.discount_end_date)
        : discount.discount_end_date;

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestError("Error: invalid discount dates");
    }
    if (startDate >= endDate) {
      throw new BadRequestError(
        "Error: discount_start_date must be before discount_end_date",
      );
    }

    const updateData: DiscountUpdateData = {};
    const fieldMap: Record<
      keyof Pick<
        UpdateDiscountPayload,
        | "name"
        | "description"
        | "code"
        | "discount_type"
        | "discount_value"
        | "max_uses"
        | "max_uses_per_user"
        | "min_order_value"
        | "is_active"
      >,
      keyof DiscountUpdateData
    > = {
      name: "discount_name",
      description: "discount_description",
      code: "discount_code",
      discount_type: "discount_type",
      discount_value: "discount_value",
      max_uses: "discount_max_uses",
      max_uses_per_user: "discount_max_uses_per_user",
      min_order_value: "discount_min_order_value",
      is_active: "discount_is_active",
    };

    for (const [payloadField, modelField] of Object.entries(fieldMap) as [
      keyof UpdateDiscountPayload,
      keyof DiscountUpdateData,
    ][]) {
      const value = payload[payloadField];
      if (value !== undefined) {
        Object.assign(updateData, { [modelField]: value });
      }
    }

    if (
      payload.discount_start_date !== undefined ||
      payload.discount_end_date !== undefined
    ) {
      updateData.discount_start_date = startDate;
      updateData.discount_end_date = endDate;
    }

    if (payload.applies_to !== undefined) {
      updateData.discount_applies_to = payload.applies_to;
      updateData.discount_product_ids =
        payload.applies_to === "all"
          ? []
          : (payload.product_ids ?? []).map(convertToObjectId);
    } else if (payload.product_ids !== undefined) {
      updateData.discount_product_ids =
        payload.product_ids.map(convertToObjectId);
    }

    return discountModel
      .findOneAndUpdate(
        {
          _id: discountObjectId,
          discount_shopId: shopObjectId,
        },
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .lean();
  }

  async getAllDiscountCodesWithProducts({
    code,
    shopId,
    limit = 10,
    page = 1,
  }: {
    code?: string;
    shopId: string;
    limit: number;
    page?: number;
  }) {
    const foundDiscountCode = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectId(shopId),
      })
      .lean();

    if (!foundDiscountCode || !foundDiscountCode.discount_is_active) {
      throw new NotFoundError("Error: discount code not found or inactive");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscountCode;
    let products: Awaited<ReturnType<typeof findAllProducts>> = [];

    if (discount_applies_to === "all") {
      // get all products for the shop
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["_id", "product_name", "product_price", "product_thumb"],
      });
    }

    if (discount_applies_to === "specific") {
      // Handle specific product IDs
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["_id", "product_name", "product_price", "product_thumb"],
      });
    }

    return products;
  }

  async getAllDiscountCodesByShop({
    shopId,
    limit = 10,
    page = 1,
  }: {
    limit?: number;
    page?: number;
    shopId: string;
  }) {
    const discount = await findAllDiscountCodesUnSelect({
      filter: { discount_shopId: convertToObjectId(shopId) },
      limit: +limit,
      page: +page,
      unSelect: ["__v", "discount_shopId"],
      sort: "ctime",
    });

    return discount;
  }

  /*
    Apply discount code for a user
  */
  async getDiscountAmount({
    codeId,
    userId,
    shopId,
    products,
  }: {
    codeId: string;
    userId: string;
    shopId: string;
    products: Array<{
      quantity: number;
      product_price: number;
    }>;
  }) {
    const foundDiscount = await checkDiscountExists({
      discount_code: codeId,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!foundDiscount) {
      throw new NotFoundError("Error: discount code not found");
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_max_uses_per_user,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new BadRequestError("Error: discount code is not active");
    }

    if (!discount_max_uses) {
      throw new BadRequestError("Error: discount code has no remaining uses");
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new BadRequestError(
        "Error: discount code is not valid at this time",
      );
    }

    let totalOrderValue = 0;

    if (discount_min_order_value > 0) {
      // get total
      totalOrderValue = products.reduce((total, product) => {
        return total + product.quantity * product.product_price;
      }, 0);

      if (totalOrderValue < discount_min_order_value) {
        throw new BadRequestError(
          `Error: total order value must be at least ${discount_min_order_value} to apply this discount code`,
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUseDiscount = discount_users_used.find(
        (user) => user.toString() === userId,
      );
      if (userUseDiscount) {
        throw new BadRequestError(
          "Error: user has already used this discount code",
        );
      }
    }

    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : (totalOrderValue * discount_value) / 100;

    return {
      totalOrderValue,
      discountAmount: amount,
      totalPrice: totalOrderValue - amount,
    };
  }

  async deleteDiscountCode({
    shopId,
    codeId,
  }: {
    shopId: string;
    codeId: string;
  }) {
    const deletedDiscount = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!deletedDiscount) {
      throw new NotFoundError("Error: discount code not found");
    }

    return deletedDiscount;
  }

  async cancelDiscountCode({
    shopId,
    codeId,
    userId,
  }: {
    shopId: string;
    codeId: string;
    userId: string;
  }) {
    const foundDiscount = await checkDiscountExists({
      discount_code: codeId,
      discount_shopId: convertToObjectId(shopId),
    });

    if (!foundDiscount) {
      throw new NotFoundError("Error: discount code not found");
    }

    if (!foundDiscount.discount_is_active) {
      throw new BadRequestError("Error: discount code is not active");
    }

    const canceledDiscount = await discountModel.findByIdAndUpdate(
      foundDiscount._id,
      {
        $pull: { discount_users_used: convertToObjectId(userId) },
        $inc: { discount_uses_count: -1, discount_max_uses: 1 },
      },
      { new: true },
    );

	return canceledDiscount;
  }
}

export default new DiscountService();
