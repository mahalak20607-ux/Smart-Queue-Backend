const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Queue name is required"],
      trim: true,
      maxlength: 100
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300
    },

    prefix: {
      type: String,
      required: [true, "Queue prefix is required"],
      uppercase: true,
      trim: true,
      maxlength: 5
    },

    currentNumber: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: ["active", "paused", "closed"],
      default: "active"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Queue", queueSchema);