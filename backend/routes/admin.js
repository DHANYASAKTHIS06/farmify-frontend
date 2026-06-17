const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const Farm = require("../models/Farm");
const Booking = require("../models/Booking");
const Report = require("../models/Report");
const authMiddleware = require("../middleware/auth");

// Middleware to ensure user is Admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin authorization required." });
  }
  next();
};

// Apply admin protection to all routes in this file
router.use(authMiddleware);
router.use(adminOnly);

// @route   GET api/admin/farmers
// @desc    Get all farmers for verification
router.get("/farmers", async (req, res) => {
  try {
    const farmers = await Farmer.find().populate("userId", "name email contactNumber isBlocked profilePicture");
    res.json(farmers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching farmers list" });
  }
});

// @route   PUT api/admin/farmers/:id/verify
// @desc    Approve or reject farmer certificate
router.put("/farmers/:id/verify", async (req, res) => {
  const { status, remarks } = req.body; // status: 'Approved' or 'Rejected'
  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }

    farmer.verificationStatus = status;
    farmer.remarks = remarks || "";
    await farmer.save();

    res.json({ message: `Farmer certificate has been ${status.toLowerCase()}`, farmer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during verification update" });
  }
});

// @route   GET api/admin/users
// @desc    Get all customers and farmers
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "Admin" } }).select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching users list" });
  }
});

// @route   PUT api/admin/users/:id/status
// @desc    Block or activate user account
router.put("/users/:id/status", async (req, res) => {
  const { isBlocked } = req.body; // boolean

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.json({ message: `User account has been ${isBlocked ? "blocked" : "activated"}`, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating account status" });
  }
});

// @route   GET api/admin/reports
// @desc    Get all customer reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("customerId", "name email contactNumber")
      .populate("farmId", "farmName address");
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching complaints" });
  }
});

// @route   PUT api/admin/reports/:id
// @desc    Resolve or dismiss customer report
router.put("/reports/:id", async (req, res) => {
  const { status } = req.body; // status: 'Resolved' or 'Dismissed'
  if (!["Resolved", "Dismissed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status;
    await report.save();

    res.json({ message: `Report status updated to ${status}`, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating report status" });
  }
});

// @route   GET api/admin/bookings
// @desc    Monitor bookings and active bookings
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name email contactNumber")
      .populate("farmerId", "name contactNumber")
      .populate("farmId", "farmName address pricing")
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching booking logs" });
  }
});

// @route   GET api/admin/analytics
// @desc    Retrieve system-wide analytics stats
router.get("/analytics", async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: "Farmer" });
    const totalCustomers = await User.countDocuments({ role: "Customer" });
    const totalFarms = await Farm.countDocuments();
    
    const bookings = await Booking.find().populate("farmId", "pricing");
    const totalBookings = bookings.length;
    
    // Revenue analytics (Sum of pricing of accepted bookings)
    const acceptedBookings = bookings.filter(b => b.bookingStatus === "Accepted");
    const totalRevenue = acceptedBookings.reduce((sum, b) => sum + (b.farmId?.pricing || 0), 0);

    // Monthly Reports (Group accepted bookings by month)
    const monthlyReports = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize current year months
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      monthlyReports[`${monthNames[i]} ${currentYear}`] = { bookings: 0, revenue: 0 };
    }

    acceptedBookings.forEach((b) => {
      const date = new Date(b.bookingDate);
      if (date.getFullYear() === currentYear) {
        const monthName = monthNames[date.getMonth()];
        const key = `${monthName} ${currentYear}`;
        if (monthlyReports[key]) {
          monthlyReports[key].bookings += 1;
          monthlyReports[key].revenue += (b.farmId?.pricing || 0);
        }
      }
    });

    const monthlyStats = Object.keys(monthlyReports).map(month => ({
      month,
      bookings: monthlyReports[month].bookings,
      revenue: monthlyReports[month].revenue,
    }));

    res.json({
      totalFarmers,
      totalCustomers,
      totalFarms,
      totalBookings,
      totalRevenue,
      monthlyReports: monthlyStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error calculating stats" });
  }
});

module.exports = router;
