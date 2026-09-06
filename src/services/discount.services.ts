import { Types } from "mongoose";
import discountModel from "../models/discount.model";
import productModel from "../models/product.model";
import {
	BadRequestError,
	ConflictRequestError,
	NotFoundError,
} from "../core/error.response";

type CreateDiscountPayload = {
	discount_name: string;
	discount_description: string;
	discount_type: "fixed_amount" | "percentage";
	discount_value: number;
	discount_code: string;
	discount_start_date: Date | string;
	discount_end_date: Date | string;
	discount_max_uses: number;
	discount_max_uses_per_user: number;
	discount_min_order_value: number;
	discount_applies_to: "all" | "specific";
	discount_product_ids?: string[];
};

class DiscountService {
	async createDiscountCode(
		shopId: string,
		payload: Partial<CreateDiscountPayload>,
	) {
		if (!Types.ObjectId.isValid(shopId)) {
			throw new BadRequestError("Error: invalid shop id");
		}

		const requiredFields: (keyof CreateDiscountPayload)[] = [
			"discount_name",
			"discount_description",
			"discount_type",
			"discount_value",
			"discount_code",
			"discount_start_date",
			"discount_end_date",
			"discount_max_uses",
			"discount_max_uses_per_user",
			"discount_min_order_value",
			"discount_applies_to",
		];
		for (const field of requiredFields) {
			if (payload[field] === undefined || payload[field] === null) {
				throw new BadRequestError(`Error: ${field} is required`);
			}
		}

		const discountCode =
			typeof payload.discount_code === "string"
				? payload.discount_code.trim().toUpperCase()
				: "";
		if (!discountCode) {
			throw new BadRequestError("Error: discount_code is required");
		}

		if (!['fixed_amount', 'percentage'].includes(payload.discount_type ?? "")) {
			throw new BadRequestError("Error: invalid discount_type");
		}
		if (!['all', 'specific'].includes(payload.discount_applies_to ?? "")) {
			throw new BadRequestError("Error: invalid discount_applies_to");
		}

		const numericFields: (keyof CreateDiscountPayload)[] = [
			"discount_value",
			"discount_max_uses",
			"discount_max_uses_per_user",
			"discount_min_order_value",
		];
		for (const field of numericFields) {
			const value = payload[field];
			if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
				throw new BadRequestError(`Error: ${field} must be a non-negative number`);
			}
		}
		const discountValue = payload.discount_value as number;
		if (payload.discount_type === "percentage" && discountValue > 100) {
			throw new BadRequestError("Error: percentage discount_value must be between 0 and 100");
		}
		if (payload.discount_max_uses_per_user! > payload.discount_max_uses!) {
			throw new BadRequestError(
				"Error: discount_max_uses_per_user cannot exceed discount_max_uses",
			);
		}

		const startDate = new Date(payload.discount_start_date as string | Date);
		const endDate = new Date(payload.discount_end_date as string | Date);
		if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
			throw new BadRequestError("Error: invalid discount dates");
		}
		if (startDate >= endDate) {
			throw new BadRequestError("Error: discount_start_date must be before discount_end_date");
		}

		const existingDiscount = await discountModel.findOne({
			discount_shopId: shopId,
			discount_code: discountCode,
		});
		if (existingDiscount) {
			throw new ConflictRequestError("Error: discount code already exists for this shop");
		}

		const productIds = payload.discount_product_ids ?? [];
		if (!Array.isArray(productIds) || productIds.some((productId) => typeof productId !== "string")) {
			throw new BadRequestError("Error: discount_product_ids must be an array of ids");
		}
		if (productIds.some((productId) => !Types.ObjectId.isValid(productId))) {
			throw new BadRequestError("Error: invalid product id");
		}
		if (payload.discount_applies_to === "specific") {
			if (productIds.length === 0) {
				throw new BadRequestError(
					"Error: discount_product_ids is required for specific discounts",
				);
			}
			const products = await productModel.find({
				_id: { $in: productIds },
				product_shop: shopId,
			}).select("_id").lean();
			if (products.length !== new Set(productIds).size) {
				throw new NotFoundError(
					"Error: one or more products do not exist or do not belong to this shop",
				);
			}
		}

		try {
			return await discountModel.create({
				...payload,
				discount_code: discountCode,
				discount_start_date: startDate,
				discount_end_date: endDate,
				discount_shopId: shopId,
				discount_product_ids: payload.discount_applies_to === "specific" ? productIds : [],
			});
		} catch (error: unknown) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				(error as { code?: number }).code === 11000
			) {
				throw new ConflictRequestError("Error: discount code already exists for this shop");
			}
			throw error;
		}
	}
}

export default new DiscountService();
