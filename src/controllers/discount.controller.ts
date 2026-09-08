import { Request, Response } from "express";
import { AuthFailureError } from "../core/error.response";
import { CREATED, OK } from "../core/success.response";
import discountService from "../services/discount.services";

class DiscountController {
  getDiscountCodesWithProducts = async (req: Request, res: Response) => {
    new OK({
      message: "Get available discount codes success",
      metadata: await discountService.getDiscountCodesWithProducts(req.query),
    }).send(res);
  };

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

  getAllDiscountCodesByShop = async (req: Request, res: Response) => {
    const shopId = req.auth?.userId;
    if (!shopId) {
      throw new AuthFailureError("Invalid Request: Missing userId in headers");
    }

    new OK({
      message: "Get discount codes by shop success",
      metadata: await discountService.getAllDiscountCodesByShop(shopId, req.query),
    }).send(res);
  };
}

export default new DiscountController();