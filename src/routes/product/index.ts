import express from "express";
import { authentication } from "../../auth/authUtils";
import ProductController from "../../controllers/product.controller";
import { asyncHandler } from "../../helper/asyncHandler";

const router = express.Router();

router.use(authentication);
router.post("/create", asyncHandler(ProductController.createProduct));
router.get(
	"/drafts/all",
	asyncHandler(ProductController.getAllDraftsForShop),
);

export default router;
