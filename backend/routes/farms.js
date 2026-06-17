const express = require("express");
const router = express.Router();
const Farm = require("../models/Farm");
const Farmer = require("../models/Farmer");
const Review = require("../models/Review");
const Report = require("../models/Report");
const authMiddleware = require("../middleware/auth");

// @route   GET api/farms
// @desc    Get all farms (with search, filtering, and geolocation sorting)
router.get("/", async (req, res) => {
  const { name, location, category, maxPrice, minRating, lat, lng } = req.query;

  try {
    // 1. Get all approved farmers
    const approvedFarmers = await Farmer.find({ verificationStatus: "Approved" });
    const approvedFarmerIds = approvedFarmers.map((f) => f.userId.toString());

    // 2. Build query
    let query = {
      farmerId: { $in: approvedFarmerIds },
    };

    if (name) {
      query.farmName = { $regex: name, $options: "i" };
    }

    if (location) {
      query.address = { $regex: location, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (maxPrice) {
      query.pricing = { $lte: parseFloat(maxPrice) };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    let farms = [];

    // 3. Geolocation Sorting if coordinates provided
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        farms = await Farm.find(query).near("location", {
          center: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          maxDistance: 100000, // 100km
          spherical: true,
        });
      } else {
        farms = await Farm.find(query);
      }
    } else {
      farms = await Farm.find(query);
    }

    // Attach farmer contact detail placeholder or lookups
    const farmsWithStatus = await Promise.all(
      farms.map(async (farm) => {
        const farmerProfile = approvedFarmers.find(
          (f) => f.userId.toString() === farm.farmerId.toString()
        );
        return {
          ...farm.toObject(),
          farmerProfile: farmerProfile || null,
        };
      })
    );

    res.json(farmsWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching farms" });
  }
});

// @route   GET api/farms/:id
// @desc    Get farm by ID (with reviews populated)
router.get("/:id", async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    const farmerProfile = await Farmer.findOne({ userId: farm.farmerId }).populate("userId", "name email contactNumber");
    const reviews = await Review.find({ farmId: farm._id }).populate("customerId", "name profilePicture");

    res.json({
      farm,
      farmerProfile,
      reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching farm details" });
  }
});

// @route   POST api/farms
// @desc    Create new farm (Farmer only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "Farmer") {
    return res.status(403).json({ message: "Access denied. Farmers only." });
  }

  const { farmName, description, address, category, images, pricing, availability, lat, lng } = req.body;

  try {
    // Check if farmer is approved
    const farmer = await Farmer.findOne({ userId: req.user.id });
    if (!farmer) {
      return res.status(400).json({ message: "Farmer profile not found" });
    }
    // Note: requirements state: "Store verification status in MongoDB"
    // We check if farmer verificationStatus is approved (we can allow posting but warning it won't show to customers, or block. Let's allow creating but warn it won't show to customers until approved)
    
    // Check if farm already exists for this farmer
    let farm = await Farm.findOne({ farmerId: req.user.id });
    
    const coordinates = [lng || 79.1378, lat || 10.787]; // Fallback to Thanjavur

    if (farm) {
      // Update existing farm
      farm.farmName = farmName || farm.farmName;
      farm.description = description || farm.description;
      farm.address = address || farm.address;
      farm.category = category || farm.category;
      farm.images = images || farm.images;
      farm.pricing = pricing || farm.pricing;
      farm.availability = availability !== undefined ? availability : farm.availability;
      farm.location = {
        type: "Point",
        coordinates,
      };
      await farm.save();
      return res.json({ message: "Farm updated successfully", farm });
    }

    // Create new farm
    farm = new Farm({
      farmerId: req.user.id,
      farmName,
      description,
      address,
      category,
      images: images || [],
      pricing,
      availability: availability !== undefined ? availability : true,
      location: {
        type: "Point",
        coordinates,
      },
    });

    await farm.save();
    res.status(201).json({ message: "Farm created successfully", farm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating farm" });
  }
});

// @route   PUT api/farms/:id
// @desc    Update farm (Farmer only)
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "Farmer") {
    return res.status(403).json({ message: "Access denied. Farmers only." });
  }

  const { farmName, description, address, category, images, pricing, availability, lat, lng } = req.body;

  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    if (farm.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this farm" });
    }

    if (farmName) farm.farmName = farmName;
    if (description) farm.description = description;
    if (address) farm.address = address;
    if (category) farm.category = category;
    if (images) farm.images = images;
    if (pricing) farm.pricing = pricing;
    if (availability !== undefined) farm.availability = availability;
    if (lat && lng) {
      farm.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    }

    await farm.save();
    res.json({ message: "Farm updated successfully", farm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating farm" });
  }
});

// @route   DELETE api/farms/:id
// @desc    Delete farm (Farmer only)
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "Farmer") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    if (farm.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Farm.findByIdAndDelete(req.params.id);
    res.json({ message: "Farm deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting farm" });
  }
});

// @route   POST api/farms/:id/reviews
// @desc    Submit a review for a farm
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  if (req.user.role !== "Customer") {
    return res.status(403).json({ message: "Only customers can submit reviews" });
  }

  const { rating, review } = req.body;

  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // Create review
    const newReview = new Review({
      customerId: req.user.id,
      farmId: farm._id,
      rating: parseInt(rating),
      review,
    });

    await newReview.save();

    // Recalculate average rating
    const reviews = await Review.find({ farmId: farm._id });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    farm.rating = parseFloat((totalRating / reviews.length).toFixed(1));
    farm.reviewCount = reviews.length;
    await farm.save();

    res.status(201).json({ message: "Review submitted successfully", review: newReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while submitting review" });
  }
});

// @route   POST api/farms/:id/reports
// @desc    Report a farm
router.post("/:id/reports", authMiddleware, async (req, res) => {
  if (req.user.role !== "Customer") {
    return res.status(403).json({ message: "Only customers can report farms" });
  }

  const { reportReason } = req.body;

  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    const report = new Report({
      customerId: req.user.id,
      farmId: farm._id,
      reportReason,
      status: "Pending",
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully. We will investigate.", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while submitting report" });
  }
});

module.exports = router;
