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
	discount_is_active?: boolean;
};

type DiscountUpdatePayload = Partial<CreateDiscountPayload>;

const discountFields = [
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
	"discount_product_ids",
	"discount_is_active",
] as const;

const isDiscountField = (field: string): field is (typeof discountFields)[number] =>
	discountFields.includes(field as (typeof discountFields)[number]);

const isDuplicateKeyError = (error: unknown) =>
	typeof error === "object" &&
	error !== null &&
	"code" in error &&
	(error as { code?: number }).code === 11000;

const normalizeProductIds = (productIds: unknown) => {
	if (!Array.isArray(productIds) || productIds.some((productId) => typeof productId !== "string")) {
		throw new BadRequestError("Error: discount_product_ids must be an array of ids");
	}
	const normalizedProductIds = [...new Set(productIds)];
	if (normalizedProductIds.some((productId) => !Types.ObjectId.isValid(productId))) {
		throw new BadRequestError("Error: invalid product id");
	}
	return normalizedProductIds;
};

const validateDiscountPayload = (
	payload: DiscountUpdatePayload,
	{ requireAllFields, usesCount = 0 }: { requireAllFields: boolean; usesCount?: number },
) => {
	if (requireAllFields) {
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
	}
	if (typeof payload.discount_name !== "string" || !payload.discount_name.trim()) {
		throw new BadRequestError("Error: discount_name is required");
	}
	if (
		typeof payload.discount_description !== "string" ||
		!payload.discount_description.trim()
	) {
		throw new BadRequestError("Error: discount_description is required");
	}
	const discountCode =
		typeof payload.discount_code === "string"
			? payload.discount_code.trim().toUpperCase()
			: "";
	if (!discountCode) {
		throw new BadRequestError("Error: discount_code is required");
	}
	if (!["fixed_amount", "percentage"].includes(payload.discount_type ?? "")) {
		throw new BadRequestError("Error: invalid discount_type");
	}
	if (!["all", "specific"].includes(payload.discount_applies_to ?? "")) {
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
	if (payload.discount_type === "percentage" && payload.discount_value! > 100) {
		throw new BadRequestError("Error: percentage discount_value must be between 0 and 100");
	}
	if (payload.discount_max_uses_per_user! > payload.discount_max_uses!) {
		throw new BadRequestError(
			"Error: discount_max_uses_per_user cannot exceed discount_max_uses",
		);
	}
	if (payload.discount_max_uses! < usesCount) {
		throw new BadRequestError("Error: discount_max_uses cannot be less than discount_uses_count");
	}

	const startDate = new Date(payload.discount_start_date as string | Date);
	const endDate = new Date(payload.discount_end_date as string | Date);
	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		throw new BadRequestError("Error: invalid discount dates");
	}
	if (startDate >= endDate) {
		throw new BadRequestError("Error: discount_start_date must be before discount_end_date");
	}
	if (payload.discount_is_active !== undefined && typeof payload.discount_is_active !== "boolean") {
		throw new BadRequestError("Error: discount_is_active must be a boolean");
	}

	return {
		...payload,
		discount_name: payload.discount_name.trim(),
		discount_description: payload.discount_description.trim(),
		discount_code: discountCode,
		discount_start_date: startDate,
		discount_end_date: endDate,
		discount_product_ids: normalizeProductIds(payload.discount_product_ids ?? []),
	};
};

class DiscountService {
	async createDiscountCode(
		shopId: string,
		payload: Partial<CreateDiscountPayload>,
	) {
		if (!Types.ObjectId.isValid(shopId)) {
			throw new BadRequestError("Error: invalid shop id");
		}

		const normalizedPayload = validateDiscountPayload(payload, { requireAllFields: true });

		const existingDiscount = await discountModel.findOne({
			discount_shopId: shopId,
			discount_code: normalizedPayload.discount_code,
		});
		if (existingDiscount) {
			throw new ConflictRequestError("Error: discount code already exists for this shop");
		}

		const productIds = normalizedPayload.discount_product_ids;
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
				...normalizedPayload,
				discount_shopId: shopId,
				discount_product_ids: payload.discount_applies_to === "specific" ? productIds : [],
			});
		} catch (error: unknown) {
			if (isDuplicateKeyError(error)) {
				throw new ConflictRequestError("Error: discount code already exists for this shop");
			}
			throw error;
		}
	}

	async updateDiscountCode(
		shopId: string,
		discountId: string,
		payload: DiscountUpdatePayload,
	) {
		if (!Types.ObjectId.isValid(shopId) || !Types.ObjectId.isValid(discountId)) {
			throw new BadRequestError("Error: invalid shop id or discount id");
		}
		if (!payload || typeof payload !== "object" || Array.isArray(payload) || Object.keys(payload).length === 0) {
			throw new BadRequestError("Error: update payload cannot be empty");
		}
		const invalidField = Object.keys(payload).find((field) => !isDiscountField(field));
		if (invalidField) {
			throw new BadRequestError(`Error: field ${invalidField} cannot be updated`);
		}

		const discount = await discountModel.findOne({ _id: discountId, discount_shopId: shopId });
		if (!discount) {
			throw new NotFoundError("Error: discount code not found");
		}
		const mergedPayload: DiscountUpdatePayload = {
			discount_name: discount.discount_name,
			discount_description: discount.discount_description,
			discount_type: discount.discount_type,
			discount_value: discount.discount_value,
			discount_code: discount.discount_code,
			discount_start_date: discount.discount_start_date,
			discount_end_date: discount.discount_end_date,
			discount_max_uses: discount.discount_max_uses,
			discount_max_uses_per_user: discount.discount_max_uses_per_user,
			discount_min_order_value: discount.discount_min_order_value,
			discount_applies_to: discount.discount_applies_to,
			discount_product_ids: discount.discount_product_ids.map((productId) => productId.toString()),
			discount_is_active: discount.discount_is_active,
			...payload,
		};
		const normalizedPayload = validateDiscountPayload(mergedPayload, {
			requireAllFields: true,
			usesCount: discount.discount_uses_count,
		});
		const productIds = normalizedPayload.discount_product_ids;
		if (normalizedPayload.discount_applies_to === "specific") {
			if (productIds.length === 0) {
				throw new BadRequestError("Error: discount_product_ids is required for specific discounts");
			}
			const products = await productModel.find({
				_id: { $in: productIds },
				product_shop: shopId,
			}).select("_id").lean();
			if (products.length !== productIds.length) {
				throw new NotFoundError("Error: one or more products do not exist or do not belong to this shop");
			}
		}

		const updateFields = Object.fromEntries(
			discountFields.map((field) => [
				field,
				field === "discount_product_ids" && normalizedPayload.discount_applies_to === "all"
					? []
					: normalizedPayload[field],
			]),
		);
		try {
			return await discountModel.findOneAndUpdate(
				{ _id: discountId, discount_shopId: shopId },
				{ $set: updateFields },
				{ new: true, runValidators: true },
			);
		} catch (error: unknown) {
			if (isDuplicateKeyError(error)) {
				throw new ConflictRequestError("Error: discount code already exists for this shop");
			}
			throw error;
		}
	}
}

export default new DiscountService();
