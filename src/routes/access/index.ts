"use strict";

import express from "express";
const router = express.Router();
import AccessController from "../../controllers/access.controller";
import { asyncHandler } from "../../auth/checkAuth";

// sign up
router.post("/shop/signup", asyncHandler(AccessController.signUp));
router.post("/shop/login", asyncHandler(AccessController.login));

// authentication
router.post("/logout", asyncHandler(AccessController.logout));

export default router;
