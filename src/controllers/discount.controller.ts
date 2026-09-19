import { Request, Response } from "express";
import { AuthFailureError } from "../core/error.response";
import { CREATED, OK } from "../core/success.response";
import discountService from "../services/discount.services";

class DiscountController {
  createDiscountCode = async (req: Request, res: Response) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    new CREATED({
      message: "Create discount code success",
      metadata: await discountService.createDiscountCode(shopId, req.body),
    }).send(res);
  };

  updateDiscountCode = async (req: Request, res: Response) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    new OK({
      message: "Update discount code success",
      metadata: await discountService.updateDiscountCode(
        shopId,
        Array.isArray(req.params.discount_id) ? "" : req.params.discount_id,
        req.body,
      ),
    }).send(res);
  };

  deleteDiscountCode = async (req: Request, res: Response) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    const codeId = Array.isArray(req.params.code_id) ? "" : req.params.code_id;

    new OK({
      message: "Delete discount code success",
      metadata: await discountService.deleteDiscountCode({
        shopId,
        codeId,
      }),
    }).send(res);
  };

  getDiscountAmount = async (req: Request, res: Response) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    const codeId = typeof req.body?.codeId === "string" ? req.body.codeId : "";
    const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    new OK({
      message: "Get discount amount success",
      metadata: await discountService.getDiscountAmount({
        codeId,
        userId,
        shopId,
        products,
      }),
    }).send(res);
  };

  getDiscountCodesWithProducts = async (req: Request, res: Response) => {
    const shopId = typeof req.query.shopId === "string" ? req.query.shopId : "";

    new OK({
      message: "Get available discount codes success",
      metadata: await discountService.getAllDiscountCodesWithProducts({
        code: typeof req.query.code === "string" ? req.query.code : undefined,
        shopId,
        limit: Number(req.query.limit ?? 10),
        page: Number(req.query.page ?? 1),
      }),
    }).send(res);
  };

  getAllDiscountCodesByShop = async (req: Request, res: Response) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    new OK({
      message: "Get all discount codes success",
      metadata: await discountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId,
        limit: Number(req.query.limit ?? 10),
        page: Number(req.query.page ?? 1),
      }),
    }).send(res);
  };
}

export default new DiscountController();
