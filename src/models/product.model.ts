import { model, Schema, Document, Types } from "mongoose";
import slugify from "slugify";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

interface IProduct extends Document {
  product_name: string;
  product_thumb: string;
  product_description?: string;
  product_slug: string;
  product_price: number;
  product_quantity: number;
  product_type: "Electronics" | "Clothing" | "Furniture";
  product_shop: Types.ObjectId;
  product_attributes: Schema.Types.Mixed;
  product_ratingAverage: number;
  product_variations: Schema.Types.Mixed[];
  isDraft: boolean;
  isPublished: boolean;
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

interface IFurniture extends Document {
  product_shop: Types.ObjectId;
  [key: string]: unknown;
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
    product_slug: {
      type: String,
      unique: true,
      lowercase: true,
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
    product_ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (value: number) => Math.round(value * 10) / 10,
    },
    product_variations: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
);

productSchema.pre("save", function () {
  if (this.isModified("product_name")) {
    this.product_slug = slugify(this.product_name, {
      lower: true,
      strict: true,
    });
  }
});

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

const furnitureSchema = new Schema<IFurniture>(
  {
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  {
    collection: "furnitures",
    timestamps: true,
    strict: false,
  },
);

export default model<IProduct>(DOCUMENT_NAME, productSchema);
export const clothingModel = model<IClothing>("Clothing", clothingSchema);
export const electronicModel = model<IElectronics>(
  "Electronics",
  electronicSchema,
);
export const furnitureModel = model<IFurniture>("Furniture", furnitureSchema);
export type { IProduct, IClothing, IElectronics, IFurniture };
