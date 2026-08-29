import {
  clothingModel,
  electronicModel,
  furnitureModel,
  IProduct,
} from "../models/product.model";
import productModel from "../models/product.model";
import { BadRequestError } from "../core/error.response";
import { findAllDraftsForShop } from "../models/repositories/product.repo";

type ProductType = "Clothing" | "Electronics" | "Furniture";

type ProductPayload = {
  product_name: string;
  product_thumb: string;
  product_description?: string;
  product_price: number;
  product_quantity: number;
  product_type: ProductType;
  product_shop?: string;
  product_attributes: Record<string, unknown>;
};

class Product {
  protected readonly product_name: string;
  protected readonly product_thumb: string;
  protected readonly product_description?: string;
  protected readonly product_price: number;
  protected readonly product_quantity: number;
  protected readonly product_type: ProductType;
  protected readonly product_shop?: string;
  protected readonly product_attributes: Record<string, unknown>;

  constructor(payload: ProductPayload) {
    this.product_name = payload.product_name;
    this.product_thumb = payload.product_thumb;
    this.product_description = payload.product_description;
    this.product_price = payload.product_price;
    this.product_quantity = payload.product_quantity;
    this.product_type = payload.product_type;
    this.product_shop = payload.product_shop;
    this.product_attributes = payload.product_attributes;
  }

  async createProduct(product_id?: string) {
    if (!product_id) {
      throw new BadRequestError("Error: product subtype id is required");
    }

    const newProduct = await productModel.create({
      _id: product_id,
      product_name: this.product_name,
      product_thumb: this.product_thumb,
      product_description: this.product_description,
      product_price: this.product_price,
      product_quantity: this.product_quantity,
      product_type: this.product_type,
      product_shop: this.product_shop,
      product_attributes: this.product_attributes,
    });

    if (!newProduct) {
      throw new BadRequestError("Error: create new Product error");
    }

    return newProduct;
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothingModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new BadRequestError("Error: create new Clothing error");
    }

    return await super.createProduct(newClothing._id.toString());
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronicModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) {
      throw new BadRequestError("Error: create new Electronics error");
    }

    return await super.createProduct(newElectronic._id.toString());
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furnitureModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) {
      throw new BadRequestError("Error: create new Furniture error");
    }

    return await super.createProduct(newFurniture._id.toString());
  }
}

class ProductFactory {
  private static productRegistry: Record<
    ProductType,
    new (payload: ProductPayload) => Product
  > = {} as Record<ProductType, new (payload: ProductPayload) => Product>;

  static registerProductType(
    type: ProductType,
    classRef: new (payload: ProductPayload) => Product,
  ) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(
    type: ProductType,
    payload: ProductPayload,
  ): Promise<IProduct> {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) {
        throw new BadRequestError(`Error: Invalid Product Type ${type}`);
    }

    return new productClass(payload).createProduct();
  }

  static async getAllDraftsForShop(
    shopId: string,
    skip = 0,
    limit = 50,
  ) {
    const normalizedSkip = Number.isFinite(skip) ? Math.max(0, skip) : 0;
    const normalizedLimit = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, limit))
      : 50;

    return findAllDraftsForShop({
      query: { product_shop: shopId, isDraft: true },
      skip: Math.floor(normalizedSkip),
      limit: Math.floor(normalizedLimit),
    });
  }
}

ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

export default ProductFactory;
export { Clothing, Electronics, Furniture, Product, ProductFactory };
export type { ProductPayload, ProductType };
