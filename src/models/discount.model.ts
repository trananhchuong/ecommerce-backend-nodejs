import { Document, model, Schema, Types } from "mongoose";

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

interface IDiscount extends Document {
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
    discount_name: {
      type: String,
      required: true,
    },
    discount_description: {
      type: String,
      required: true,
    },
    discount_type: {
      type: String,
      default: "fixed_amount",
      enum: ["fixed_amount", "percentage"],
    },
    discount_value: {
      type: Number,
      required: true,
    },
    discount_code: {
      type: String,
      required: true,
    },
    discount_start_date: {
      type: Date,
      required: true,
    },
    discount_end_date: {
      type: Date,
      required: true,
    },
    discount_max_uses: {
      type: Number,
      required: true,
    },
    discount_uses_count: {
      type: Number,
      required: true,
      default: 0,
    },
    discount_users_used: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    discount_max_uses_per_user: {
      type: Number,
      required: true,
    },
    discount_min_order_value: {
      type: Number,
      required: true,
    },
    discount_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
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
export type { IDiscount };

