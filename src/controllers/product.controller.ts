import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../core/success.response";
import productService from "../services/product.services";
import { ProductPayload } from "../services/product.services";

class ProductController {
  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    const payload: ProductPayload = {
      ...req.body,
      product_shop: req.auth?.userId,
    };

    new SuccessResponse({
      message: "Create new product success",
      metadata: await productService.createProduct(
        payload.product_type,
        payload,
      ),
    }).send(res);
  };
}

export default new ProductController();
