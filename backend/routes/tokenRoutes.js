const express = require("express");

const {
    generateToken,
    getMyTokens,
    getQueueTokens,
    getQueueStatus,
    callNextToken,
    updateTokenStatus,
    cancelMyToken
} = require("../controllers/tokenController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================
// Generate New Token
// User
// ======================================

router.post(
    "/",
    protect,
    generateToken
);


// ======================================
// Get Logged-in User's Tokens
// User
// ======================================

router.get(
    "/my",
    protect,
    getMyTokens
);


// ======================================
// Get Queue Live Status
// User + Admin
// ======================================

router.get(
    "/queue/:queueId/status",
    protect,
    getQueueStatus
);


// ======================================
// Cancel User's Waiting Token
// User
// ======================================

router.patch(
    "/:id/cancel",
    protect,
    cancelMyToken
);


// ======================================
// Admin: Get Tokens For A Queue
// ======================================

router.get(
    "/queue/:queueId",
    protect,
    authorize("admin"),
    getQueueTokens
);


// ======================================
// Admin: Call Next Token
// ======================================

router.post(
    "/queue/:queueId/next",
    protect,
    authorize("admin"),
    callNextToken
);


// ======================================
// Admin: Update Token Status
// ======================================

router.patch(
    "/:id/status",
    protect,
    authorize("admin"),
    updateTokenStatus
);


module.exports = router;