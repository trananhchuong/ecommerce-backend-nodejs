import express from "express";
const router = express.Router();
import AccessController from "../../controllers/access.controller";
import { asyncHandler } from "../../helper/asyncHandler";
import { authentication } from "../../auth/authUtils";

// sign up
router.post("/shop/signup", asyncHandler(AccessController.signUp));
router.post("/shop/login", asyncHandler(AccessController.login));

// authentication
router.use(authentication)
router.post("/shop/logout", asyncHandler(AccessController.logout));
router.post("/shop/refresh", asyncHandler(AccessController.refreshToken));

export default router;
