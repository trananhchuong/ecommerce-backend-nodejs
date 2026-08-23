import {
  clothingModel,
  electronicModel,
  IProduct,
} from "../models/product.model";
import productModel from "../models/product.model";
import { BadRequestError } from "../core/error.response";

type ProductType = "Clothing" | "Electronics";

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

  async createProduct() {
    const newProduct = await productModel.create({
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
    const newClothing = await clothingModel.create(this.product_attributes);
    if (!newClothing) {
      throw new BadRequestError("Error: create new Clothing error");
    }

    return super.createProduct();
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronicModel.create(this.product_attributes);
    if (!newElectronic) {
      throw new BadRequestError("Error: create new Electronics error");
    }

    return super.createProduct();
  }
}

class ProductFactory {
  static async createProduct(
    type: ProductType,
    payload: ProductPayload,
  ): Promise<IProduct> {
    switch (type) {
      case "Electronics":
        return new Electronics(payload).createProduct();
      case "Clothing":
        return new Clothing(payload).createProduct();
      default:
        throw new BadRequestError(`Error: Invalid Product Type ${type}`);
    }
  }
}

export default ProductFactory;
export { Clothing, Electronics, Product, ProductFactory };
export type { ProductPayload, ProductType };
