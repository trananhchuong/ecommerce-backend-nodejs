import express from "express";
import { authentication } from "../../auth/authUtils";
import DiscountController from "../../controllers/discount.controller";
import { asyncHandler } from "../../helper/asyncHandler";

const router = express.Router();

router.get("/all", asyncHandler(DiscountController.getDiscountCodesWithProducts));
router.use(authentication);
router.get("/shop/all", asyncHandler(DiscountController.getAllDiscountCodesByShop));
router.post("/create", asyncHandler(DiscountController.createDiscountCode));
router.patch("/update/:discount_id", asyncHandler(DiscountController.updateDiscountCode));

export default router;