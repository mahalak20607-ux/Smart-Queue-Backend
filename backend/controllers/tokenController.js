const Queue = require("../models/Queue");
const Token = require("../models/Token");

// ======================================
// Generate New Token
// ======================================

const generateToken = async (req, res) => {
    try {
        const { queueId } = req.body;

        if (!queueId) {
            return res.status(400).json({
                success: false,
                message: "Queue ID is required"
            });
        }

        const queue = await Queue.findOneAndUpdate(
            {
                _id: queueId,
                status: "active"
            },
            {
                $inc: {
                    currentNumber: 1
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Active queue not found"
            });
        }

        const tokenCode =
            queue.prefix +
            String(queue.currentNumber).padStart(3, "0");

        const token = await Token.create({
            tokenNumber: queue.currentNumber,
            tokenCode,
            queue: queue._id,
            user: req.user.id,
            status: "waiting"
        });

        res.status(201).json({
            success: true,
            message: "Token generated successfully",
            token: {
                id: token._id,
                tokenCode: token.tokenCode,
                tokenNumber: token.tokenNumber,
                queue: {
                    id: queue._id,
                    name: queue.name,
                    prefix: queue.prefix
                },
                status: token.status,
                issuedAt: token.issuedAt
            }
        });

    } catch (error) {
        console.error("Generate Token Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while generating token"
        });
    }
};


// ======================================
// Get My Tokens
// ======================================

const getMyTokens = async (req, res) => {
    try {
        const tokens = await Token.find({
            user: req.user.id
        })
            .populate("queue", "name prefix status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tokens.length,
            tokens
        });

    } catch (error) {
        console.error("Get My Tokens Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching tokens"
        });
    }
};


// ======================================
// Get Tokens For A Queue
// Admin Only
// ======================================

const getQueueTokens = async (req, res) => {
    try {
        const { queueId } = req.params;

        const tokens = await Token.find({
            queue: queueId
        })
            .populate("user", "name email")
            .populate("queue", "name prefix status")
            .sort({ tokenNumber: 1 });

        res.status(200).json({
            success: true,
            count: tokens.length,
            tokens
        });

    } catch (error) {
        console.error("Get Queue Tokens Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching queue tokens"
        });
    }
};


// ======================================
// Get Current Queue Status
// User + Admin
// ======================================

const getQueueStatus = async (req, res) => {
    try {
        const { queueId } = req.params;

        // Find queue
        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found"
            });
        }

        // Current serving token
        const nowServing = await Token.findOne({
            queue: queueId,
            status: "serving"
        })
            .sort({ tokenNumber: 1 })
            .select("tokenNumber tokenCode status servedAt");

        // Next waiting token
        const nextToken = await Token.findOne({
            queue: queueId,
            status: "waiting"
        })
            .sort({ tokenNumber: 1 })
            .select("tokenNumber tokenCode status issuedAt");

        // Current user's waiting token
        const myToken = await Token.findOne({
            queue: queueId,
            user: req.user.id,
            status: "waiting"
        })
            .sort({ tokenNumber: 1 })
            .select("tokenNumber tokenCode status issuedAt");

        // Number of people before current user
        let peopleBeforeYou = 0;

        if (myToken) {
            peopleBeforeYou = await Token.countDocuments({
                queue: queueId,
                status: "waiting",
                tokenNumber: {
                    $lt: myToken.tokenNumber
                }
            });
        }

        res.status(200).json({
            success: true,

            queue: {
                id: queue._id,
                name: queue.name,
                prefix: queue.prefix,
                status: queue.status
            },

            nowServing: nowServing || null,
            nextToken: nextToken || null,
            myToken: myToken || null,
            peopleBeforeYou
        });

    } catch (error) {
        console.error("Get Queue Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while getting queue status"
        });
    }
};


// ======================================
// Call Next Token
// Admin Only
// ======================================

const callNextToken = async (req, res) => {
    try {
        const { queueId } = req.params;

        // Check queue
        const queue = await Queue.findById(queueId);

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: "Queue not found"
            });
        }

        // Check if a token is already serving
        const currentServing = await Token.findOne({
            queue: queueId,
            status: "serving"
        });

        if (currentServing) {
            return res.status(400).json({
                success: false,
                message: `${currentServing.tokenCode} is currently being served`
            });
        }

        // Find oldest waiting token
        const nextToken = await Token.findOneAndUpdate(
            {
                queue: queueId,
                status: "waiting"
            },
            {
                status: "serving",
                servedAt: new Date()
            },
            {
                new: true,
                sort: {
                    tokenNumber: 1
                },
                runValidators: true
            }
        )
            .populate("user", "name email")
            .populate("queue", "name prefix status");

        if (!nextToken) {
            return res.status(404).json({
                success: false,
                message: "No waiting tokens in this queue"
            });
        }

        res.status(200).json({
            success: true,
            message: `${nextToken.tokenCode} is now being served`,
            token: nextToken
        });

    } catch (error) {
        console.error("Call Next Token Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while calling next token"
        });
    }
};


// ======================================
// Update Token Status
// Admin Only
// ======================================

const updateTokenStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const allowedStatuses = [
            "waiting",
            "serving",
            "completed",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid token status"
            });
        }

        const updateData = {
            status
        };

        if (status === "serving") {
            updateData.servedAt = new Date();
        }

        if (status === "completed") {
            updateData.completedAt = new Date();
        }

        const token = await Token.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("user", "name email")
            .populate("queue", "name prefix status");

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Token status updated successfully",
            token
        });

    } catch (error) {
        console.error("Update Token Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating token"
        });
    }
};


// ======================================
// Cancel My Token
// ======================================

const cancelMyToken = async (req, res) => {
    try {
        const { id } = req.params;

        const token = await Token.findOne({
            _id: id,
            user: req.user.id
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token not found"
            });
        }

        if (token.status !== "waiting") {
            return res.status(400).json({
                success: false,
                message: "Only waiting tokens can be cancelled"
            });
        }

        token.status = "cancelled";

        await token.save();

        res.status(200).json({
            success: true,
            message: "Token cancelled successfully",
            token
        });

    } catch (error) {
        console.error("Cancel Token Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while cancelling token"
        });
    }
};


// ======================================
// Export Controllers
// ======================================

module.exports = {
    generateToken,
    getMyTokens,
    getQueueTokens,
    getQueueStatus,
    callNextToken,
    updateTokenStatus,
    cancelMyToken
};