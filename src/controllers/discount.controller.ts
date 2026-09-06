import { Request, Response } from "express";
import { AuthFailureError } from "../core/error.response";
import { CREATED } from "../core/success.response";
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
}

export default new DiscountController();