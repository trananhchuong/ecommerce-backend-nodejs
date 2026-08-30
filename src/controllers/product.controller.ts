import { Request, Response, NextFunction } from "express";
import { AuthFailureError } from "../core/error.response";
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

  getAllDraftsForShop = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    const skip = Number(req.query.skip ?? 0);
    const limit = Number(req.query.limit ?? 50);

    new SuccessResponse({
      message: "Get all draft products success",
      metadata: await productService.getAllDraftsForShop({
        shopId,
        skip,
        limit,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    const skip = Number(req.query.skip ?? 0);
    const limit = Number(req.query.limit ?? 50);

    new SuccessResponse({
      message: "Get all published products success",
      metadata: await productService.getAllPublishForShop({
        shopId,
        skip,
        limit,
      }),
    }).send(res);
  };

  getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    const skip = Number(req.query.skip ?? 0);
    const limit = Number(req.query.limit ?? 50);

    new SuccessResponse({
      message: "Get all products success",
      metadata: await productService.getAllProducts({
        skip,
        limit,
      }),
    }).send(res);
  };

  searchProductByPublic = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const rawKeySearch =
      (Array.isArray(req.query.keySearch)
        ? req.query.keySearch[0]
        : req.query.keySearch) ??
      (Array.isArray(req.params.keySearch)
        ? req.params.keySearch[0]
        : req.params.keySearch) ??
      "";
    const keySearch = typeof rawKeySearch === "string" ? rawKeySearch.trim() : "";
    const skip = Number(req.query.skip ?? 0);
    const limit = Number(req.query.limit ?? 50);

    new SuccessResponse({
      message: "Get list search product success",
      metadata: await productService.searchProductByPublic({
        keySearch,
        skip,
        limit,
      }),
    }).send(res);
  };

  publishProductByShop = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    new SuccessResponse({
      message: "Publish product success",
      metadata: await productService.publishProductByShop({
        product_shop: shopId,
        product_id: productId,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    new SuccessResponse({
      message: "Unpublish product success",
      metadata: await productService.unPublishProductByShop({
        product_shop: shopId,
        product_id: productId,
      }),
    }).send(res);
  };
}

export default new ProductController();
