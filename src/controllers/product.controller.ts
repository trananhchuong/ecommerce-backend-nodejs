import { Request, Response, NextFunction } from "express";
import { AuthFailureError, BadRequestError } from "../core/error.response";
import { SuccessResponse } from "../core/success.response";
import productService from "../services/product.services";

class ProductController {
  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
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

  findProduct = async (req: Request, res: Response, next: NextFunction) => {
    const productId = Array.isArray(req.params.product_id)
      ? req.params.product_id[0]
      : req.params.product_id;

    new SuccessResponse({
      message: "Get list detail product success",
      metadata: await productService.findProduct({
        product_id: productId,
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

  updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    const productId = Array.isArray(req.params.product_id)
      ? req.params.product_id[0]
      : req.params.product_id;

    // Sensitive fields that should never be updated directly
    const SENSITIVE_FIELDS = ["_id", "product_shop", "isDraft", "isPublished"];

    // Extract and sanitize update fields
    const bodyUpdate = { ...req.body };
    
    // Remove sensitive fields
    SENSITIVE_FIELDS.forEach((field) => {
      delete bodyUpdate[field];
    });

    // Remove undefined fields (for partial updates)
    const sanitizedUpdate = Object.fromEntries(
      Object.entries(bodyUpdate).filter(([, value]) => value !== undefined),
    );

    // Validate: at least 1 field must be provided
    if (Object.keys(sanitizedUpdate).length === 0) {
      throw new BadRequestError(
        "Error: No valid fields to update. Please provide at least one field.",
      );
    }

    // Validate data types for specific fields
    if (
      sanitizedUpdate.product_price !== undefined &&
      (typeof sanitizedUpdate.product_price !== "number" ||
        (sanitizedUpdate.product_price as number) < 0)
    ) {
      throw new BadRequestError(
        "Error: product_price must be a non-negative number",
      );
    }

    if (
      sanitizedUpdate.product_quantity !== undefined &&
      (!Number.isInteger(sanitizedUpdate.product_quantity) ||
        (sanitizedUpdate.product_quantity as number) < 0)
    ) {
      throw new BadRequestError(
        "Error: product_quantity must be a non-negative integer",
      );
    }

    new SuccessResponse({
      message: "Update product success",
      metadata: await productService.updateProduct({
        product_id: productId,
        bodyUpdate: sanitizedUpdate,
        product_shop: shopId,
      }),
    }).send(res);
  };
}

export default new ProductController();
