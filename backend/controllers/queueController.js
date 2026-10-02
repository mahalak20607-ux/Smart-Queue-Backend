const Queue = require("../models/Queue");

// ==========================================
// CREATE A NEW QUEUE
// ==========================================
const createQueue = async (req, res) => {
    try {
        const { name, description, prefix } = req.body;

        if (!name || !prefix) {
            return res.status(400).json({
                success: false,
                message: "Queue name and prefix are required"
            });
        }

        const existingQueue = await Queue.findOne({
            prefix: prefix.toUpperCase()
        });

        if (existingQueue) {
            return res.status(409).json({
                success: false,
                message: "Queue prefix already exists"
            });
        }

        const queue = await Queue.create({
            name,
            description,
            prefix: prefix.toUpperCase(),
            createdBy: req.user.id,
            status: "active"
        });

        res.status(201).json({
            success: true,
            message: "Queue created successfully",
            queue
        });

    } catch (error) {
        console.error("Create Queue Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating queue"
        });
    }
};


// ==========================================
// GET ALL QUEUES
// ==========================================
const getQueues = async (req, res) => {
    try {
        const queues = await Queue.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: queues.length,
            queues
        });

    } catch (error) {
        console.error("Get Queues Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching queues"
        });
    }
};


// ==========================================
// GET ACTIVE QUEUES
// ==========================================
const getActiveQueues = async (req, res) => {
    try {
        const queues = await Queue.find({
            status: "active"
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: queues.length,
            queues
        });

    } catch (error) {
        console.error("Get Active Queues Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching active queues"
        });
    }
};


// ==========================================
// UPDATE QUEUE STATUS
// ==========================================
const updateQueueStatus = async (req, res) => {
    try {

        const { status, isActive } = req.body;

        // Support both formats
        let newStatus = status;

        if (typeof isActive === "boolean") {
            newStatus = isActive ? "active" : "closed";
        }

        // Allowed queue statuses
        const allowedStatuses = [
            "active",
            "paused",
            "closed"
        ];

        // Check status
        if (!allowedStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid queue status"
            });
        }

        // Find and update queue
        const queue = await Queue.findByIdAndUpdate(
            req.params.id,
            {
                status: newStatus
            },
            {
                new: true,
                runValidators: true
            }
        );

        // Queue not found
        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found"
            });
        }

        // Success
        res.status(200).json({
            success: true,
            message: "Queue status updated successfully",
            queue
        });

    } catch (error) {

        console.error("Update Queue Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating queue status"
        });
    }
};


// ==========================================
// DELETE QUEUE
// ==========================================
const deleteQueue = async (req, res) => {
    try {

        const queue = await Queue.findByIdAndDelete(
            req.params.id
        );

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Queue deleted successfully"
        });

    } catch (error) {

        console.error("Delete Queue Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting queue"
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
    createQueue,
    getQueues,
    getActiveQueues,
    updateQueueStatus,
    deleteQueue
};