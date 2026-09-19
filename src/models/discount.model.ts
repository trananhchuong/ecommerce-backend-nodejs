import { Document, model, Schema, Types } from "mongoose";

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

export interface IDiscount extends Document {
  discount_name: string;
  discount_description: string;
  discount_type: "fixed_amount" | "percentage";
  discount_value: number;
  discount_code: string;
  discount_start_date: Date;
  discount_end_date: Date;
  discount_max_uses: number;
  discount_uses_count: number;
  discount_users_used: Types.ObjectId[];
  discount_max_uses_per_user: number;
  discount_min_order_value: number;
  discount_shopId: Types.ObjectId;
  discount_is_active: boolean;
  discount_applies_to: "all" | "specific";
  discount_product_ids: Types.ObjectId[];
}

const discountSchema = new Schema<IDiscount>(
  {
    // Discount name
    discount_name: {
      type: String,
      required: true,
    },
    // Detailed description of the discount
    discount_description: {
      type: String,
      required: true,
    },
    // Discount type: fixed amount or percentage
    discount_type: {
      type: String,
      default: "fixed_amount",
      enum: ["fixed_amount", "percentage"],
    },
    // Discount value, for example 10,000 or 10 percent
    discount_value: {
      type: Number,
      required: true,
    },
    // Discount code used by customers
    discount_code: {
      type: String,
      required: true,
    },
    // Date when the discount becomes active
    discount_start_date: {
      type: Date,
      required: true,
    },
    // Date when the discount expires
    discount_end_date: {
      type: Date,
      required: true,
    },
    // Maximum number of times the discount can be used
    discount_max_uses: {
      type: Number,
      required: true,
    },
    // Number of times the discount has been used
    discount_uses_count: {
      type: Number,
      required: true,
      default: 0,
    },
    // List of users who have used the discount
    discount_users_used: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    // Maximum number of times each user can use the discount
    discount_max_uses_per_user: {
      type: Number,
      required: true,
    },
    // Minimum order value required to apply the discount
    discount_min_order_value: {
      type: Number,
      required: true,
    },
    // ID of the shop that owns the discount
    discount_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    // Whether the discount is active
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    // Discount scope: all products or specific products
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    // IDs of the products eligible for the discount
    discount_product_ids: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

discountSchema.index({ discount_shopId: 1, discount_code: 1 }, { unique: true });

export default model<IDiscount>(DOCUMENT_NAME, discountSchema);

