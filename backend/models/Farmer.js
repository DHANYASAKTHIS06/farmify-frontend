const mongoose = require("mongoose");

const FarmerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  farmName: {
    type: String,
    required: true,
  },
  farmDescription: {
    type: String,
    default: "",
  },
  farmAddress: {
    type: String,
    required: true,
  },
  farmCategory: {
    type: String,
    required: true,
  },
  certificate: {
    type: String, // URL of uploaded certificate
    default: "",
  },
  certificateId: {
    type: String,
    default: "",
  },
  verificationStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  remarks: {
    type: String,
    default: "",
  },
  earningsSummary: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Farmer", FarmerSchema);
