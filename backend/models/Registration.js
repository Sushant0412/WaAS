const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    walletAddress: String,
    email: String,
    qrToken: String, // Unique token for QR code
    qrCode: String, // Base64 QR code image
    emailSent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    adminMessage: {
      type: String,
      default: "",
    },
    // Cancellation fields
    cancellationReason: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String, // "user" or "admin"
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Registration", registrationSchema);

