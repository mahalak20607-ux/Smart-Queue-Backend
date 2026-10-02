const express = require("express");

const {
    createQueue,
    getQueues,
    getActiveQueues,
    updateQueueStatus,
    deleteQueue
} = require("../controllers/queueController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// Admin Routes
// ======================================

// Create Queue
router.post(
    "/",
    protect,
    authorize("admin"),
    createQueue
);

// Get All Queues
router.get(
    "/",
    protect,
    authorize("admin"),
    getQueues
);

// Update Queue Status
router.patch(
    "/:id/status",
    protect,
    authorize("admin"),
    updateQueueStatus
);

// Delete Queue
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteQueue
);

// ======================================
// User Routes
// ======================================

// Get Active Queues
router.get(
    "/active",
    protect,
    getActiveQueues
);

// ======================================
// Export Router
// ======================================

module.exports = router;