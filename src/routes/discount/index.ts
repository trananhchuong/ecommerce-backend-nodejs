import express from "express";
import { authentication } from "../../auth/authUtils";
import DiscountController from "../../controllers/discount.controller";
import { asyncHandler } from "../../helper/asyncHandler";

const router = express.Router();

router.use(authentication);
router.post("/create", asyncHandler(DiscountController.createDiscountCode));
router.patch("/update/:discount_id", asyncHandler(DiscountController.updateDiscountCode));

export default router;