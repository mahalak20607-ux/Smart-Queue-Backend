const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    // Token number inside the queue
    tokenNumber: {
      type: Number,
      required: true,
      min: 1
    },

    // Display token code like GEN001, BIL002
    tokenCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    // Queue reference
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true
    },

    // User who generated the token
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Current token status
    status: {
      type: String,
      enum: [
        "waiting",
        "serving",
        "completed",
        "cancelled"
      ],
      default: "waiting"
    },

    // When token was generated
    issuedAt: {
      type: Date,
      default: Date.now
    },

    // When admin starts serving this token
    servedAt: {
      type: Date,
      default: null
    },

    // When service is completed
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Token", tokenSchema);