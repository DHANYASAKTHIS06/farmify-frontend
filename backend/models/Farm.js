const mongoose = require("mongoose");

const FarmSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  farmName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true, // e.g. "Organic Vegetables", "Dairy", "Rice Paddy", etc.
  },
  images: [{
    type: String, // URLs of uploaded images
  }],
  pricing: {
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  rating: {
    type: Number,
    default: 0, // Average rating
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a 2dsphere index for geolocation queries
FarmSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Farm", FarmSchema);
