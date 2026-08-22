import { model, Schema, Document } from "mongoose";

const DOCUMENT_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";

/** API credential used by the API-key authentication and permission middleware. */
interface IApikey extends Document {
  /** Client/application credential sent in the `x-api-key` request header. */
  key: string;
  /** Whether the key is active and accepted by API-key middleware lookup. */
  status: boolean;
  /** Permission levels checked by the permission middleware: 0000 basic, 1111 intermediate, 2222 advanced. */
  permissions: string[];
}

// Declare the Schema of the Mongo model
const apikeySchema = new Schema<IApikey>(
  {
    key: {
      /** Client/application credential sent in the `x-api-key` request header. */
      type: String,
      required: true,
      unique: true,
    },
    status: {
      /** Only active keys are accepted by API-key middleware lookup. */
      type: Boolean,
      default: true,
    },
    permissions: {
      /** Levels checked by permission middleware: 0000 basic, 1111 intermediate, 2222 advanced. */
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
