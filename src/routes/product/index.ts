import express from "express";
import { authentication } from "../../auth/authUtils";
import ProductController from "../../controllers/product.controller";
import { asyncHandler } from "../../helper/asyncHandler";

const router = express.Router();

router.get("/all", asyncHandler(ProductController.getAllProducts));
router.get(
  "/search/:keySearch",
  asyncHandler(ProductController.searchProductByPublic),
);
router.get("/detail/:product_id", asyncHandler(ProductController.findProduct));

router.use(authentication);
router.post("/create", asyncHandler(ProductController.createProduct));
router.get(
  "/drafts/all",
  asyncHandler(ProductController.getAllDraftsForShop),
);
router.get(
  "/published/all",
  asyncHandler(ProductController.getAllPublishForShop),
);
router.post(
  "/publish/:id",
  asyncHandler(ProductController.publishProductByShop),
);
router.post(
  "/unpublish/:id",
  asyncHandler(ProductController.unPublishProductByShop),
);

export default router;
