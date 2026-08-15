'use strict';

const express = require('express');
const router = express.Router();
const { apiKey, permission } = require('../auth/checkAuth');

/**
 * REQUEST FLOW - Two-Layer Security Middleware
 * 
 * ┌─────────────────┐
 * │   Request       │
 * │  with API Key   │
 * └────────┬────────┘
 *          │
 *          ▼
 *     ┌────────────────┐
 *     │ 1. apiKey      │ ← Is this a valid API key?
 *     │    middleware  │
 *     └────────┬───────┘
 *          │ YES ✓
 *          ▼
 *     ┌────────────────┐
 *     │ 2. permission  │ ← Does this key have '0000' permission?
 *     │    middleware  │
 *     └────────┬───────┘
 *          │ YES ✓
 *          ▼
 *     ┌────────────────┐
 *     │ Your Routes    │ ← Process the request
 *     │ /v1/api/...    │
 *     └────────────────┘
 */

// Security Layer 1: API Key Authentication
// Validates the x-api-key header to identify which application/client is making the request
// Blocks unauthorized applications from accessing the API
// Fetches the API key object from database and attaches it to req.objKey for next middleware
router.use(apiKey);

// Security Layer 2: Permission-Based Access Control
// Verifies the API key has the required permission level ('0000' = basic access)
// Implements role-based access control (RBAC) for different API key tiers
// Permission levels: '0000' (basic), '1111' (intermediate), '2222' (advanced)
router.use(permission('0000'));

router.use('/v1/api', require('./access'));

module.exports = router;