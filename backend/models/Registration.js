const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    walletAddress: String,
    status: {
      type: String,
      default: "pending",
    },
    adminMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Registration", registrationSchema);
