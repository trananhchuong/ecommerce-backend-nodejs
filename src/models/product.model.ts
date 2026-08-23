import { model, Schema, Document, Types } from "mongoose";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

interface IProduct extends Document {
  product_name: string;
  product_thumb: string;
  product_description?: string;
  product_price: number;
  product_quantity: number;
  product_type: "Electronics" | "Clothing" | "Furniture";
  product_shop: Types.ObjectId;
  product_attributes: Schema.Types.Mixed;
}

interface IClothing extends Document {
  brand: string;
  size?: string;
  material?: string;
  product_shop: Types.ObjectId;
}

interface IElectronics {
  manufacturer: string;
  model?: string;
  color?: string;
  product_shop: Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
);

const clothingSchema = new Schema<IClothing>(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  {
    collection: "clothes",
    timestamps: true,
  },
);

const electronicSchema = new Schema<IElectronics>(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    model: String,
    color: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  {
    collection: "electronics",
    timestamps: true,
  },
);

export default model<IProduct>(DOCUMENT_NAME, productSchema);
export const clothingModel = model<IClothing>("Clothing", clothingSchema);
export const electronicModel = model<IElectronics>(
  "Electronics",
  electronicSchema,
);
export type { IProduct, IClothing, IElectronics };
