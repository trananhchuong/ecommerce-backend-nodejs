"use strict";

import { model, Schema, Document } from "mongoose";

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";

interface IShop extends Document {
  name?: string;
  email?: string;
  password: string;
  status: "active" | "inactive";
  verify: boolean;
  roles: string[];
}

// Declare the Schema of the Mongo model
const shopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    verify: {
      type: Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

// Export the model
export default model<IShop>(DOCUMENT_NAME, shopSchema);
export type { IShop };
