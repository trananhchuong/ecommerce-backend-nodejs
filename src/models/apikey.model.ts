"use strict";

// key !dmbg install by Mongo Snippets for Node-js

import { model, Schema, Document } from "mongoose";

const DOCUMENT_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";

interface IApikey extends Document {
  key: string;
  status: boolean;
  permissions: string[];
}

// Declare the Schema of the Mongo model
const apikeySchema = new Schema<IApikey>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ["0000", "1111", "2222"],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

// Export the model
export default model<IApikey>(DOCUMENT_NAME, apikeySchema);
export type { IApikey };
