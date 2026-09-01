import { Document, model, Schema, Types } from "mongoose";

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

interface IInventory extends Document {
  invent_productId: Types.ObjectId;
  invent_shopId: Types.ObjectId;
  invent_stock: number;
  invent_location: string;
  invent_reservations: Schema.Types.Mixed[];
}

const inventorySchema = new Schema<IInventory>(
  {
    invent_productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    invent_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    invent_stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Inventory stock cannot be negative"],
    },
    invent_location: {
      type: String,
      default: "Unknown",
      trim: true,
    },
    invent_reservations: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
);

inventorySchema.index({ invent_productId: 1, invent_shopId: 1 }, { unique: true });

export default model<IInventory>(DOCUMENT_NAME, inventorySchema);
export type { IInventory };
