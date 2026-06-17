const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Farm = require("../models/Farm");
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

// @route   POST api/bookings
// @desc    Book a farm visit (Customer only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "Customer") {
    return res.status(403).json({ message: "Only customers can book farm visits" });
  }

  const { farmId, bookingDate, bookingTime } = req.body;

  try {
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    const customer = await User.findById(req.user.id);
    const farmerUser = await User.findById(farm.farmerId);

    // Create booking
    const booking = new Booking({
      customerId: req.user.id,
      farmerId: farm.farmerId,
      farmId: farm._id,
      bookingDate: new Date(bookingDate),
      bookingTime,
      bookingStatus: "Pending",
    });

    await booking.save();

    // Create Notification for Farmer instantly
    const notification = new Notification({
      receiverId: farm.farmerId,
      title: "New Booking Request 🚜",
      message: `${customer.name} wants to visit ${farm.farmName} on ${new Date(bookingDate).toDateString()} at ${bookingTime}.`,
    });
    await notification.save();

    // Send Email to Farmer
    if (farmerUser && farmerUser.email) {
      await sendEmail({
        to: farmerUser.email,
        subject: "New Visit Booking Request - Farmify",
        text: `Hello, you have received a new booking request for your farm ${farm.farmName} from ${customer.name} for ${new Date(bookingDate).toDateString()} at ${bookingTime}. Please log in to accept or reject.`,
        html: `<h3>New Booking Request</h3><p>Hello,</p><p>You have a new booking request for your farm <b>${farm.farmName}</b> from <b>${customer.name}</b>.</p><p>Date: ${new Date(bookingDate).toDateString()}<br/>Time: ${bookingTime}</p><p>Please log in to your dashboard to review this request.</p>`,
      });
    }

    res.status(201).json({ message: "Booking submitted successfully.", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while booking visit" });
  }
});

// @route   GET api/bookings
// @desc    Get booking history/upcoming bookings (Customer or Farmer)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let bookings = [];
    if (req.user.role === "Customer") {
      bookings = await Booking.find({ customerId: req.user.id })
        .populate("farmId", "farmName address category images pricing")
        .populate("farmerId", "name contactNumber email")
        .sort({ bookingDate: -1 });
    } else if (req.user.role === "Farmer") {
      bookings = await Booking.find({ farmerId: req.user.id })
        .populate("farmId", "farmName address")
        .populate("customerId", "name contactNumber email profilePicture")
        .sort({ bookingDate: -1 });
    } else if (req.user.role === "Admin") {
      bookings = await Booking.find()
        .populate("farmId", "farmName address")
        .populate("customerId", "name")
        .populate("farmerId", "name")
        .sort({ bookingDate: -1 });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
});

// @route   PUT api/bookings/:id
// @desc    Accept or reject booking (Farmer only)
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "Farmer") {
    return res.status(403).json({ message: "Access denied. Farmers only." });
  }

  const { status } = req.body; // 'Accepted' or 'Rejected'
  if (!["Accepted", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const booking = await Booking.findById(req.params.id)
      .populate("farmId", "farmName pricing")
      .populate("customerId", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to manage this booking" });
    }

    booking.bookingStatus = status;
    await booking.save();

    // Create Notification for Customer
    const notification = new Notification({
      receiverId: booking.customerId._id,
      title: `Booking Request ${status} 🚜`,
      message: `Your booking request at ${booking.farmId.farmName} for ${new Date(booking.bookingDate).toDateString()} has been ${status.toLowerCase()}.`,
    });
    await notification.save();

    // Send Email to Customer
    if (booking.customerId && booking.customerId.email) {
      await sendEmail({
        to: booking.customerId.email,
        subject: `Farm Visit Booking ${status} - Farmify`,
        text: `Hello, your booking request for ${booking.farmId.farmName} on ${new Date(booking.bookingDate).toDateString()} has been ${status.toLowerCase()} by the farmer.`,
        html: `<h3>Booking Request ${status}</h3><p>Hello,</p><p>Your booking request for <b>${booking.farmId.farmName}</b> has been <b>${status.toLowerCase()}</b>.</p><p>Date: ${new Date(booking.bookingDate).toDateString()}</p>`,
      });
    }

    // Update Farmer earnings if accepted
    if (status === "Accepted") {
      const farmerProfile = await Farmer.findOne({ userId: req.user.id });
      if (farmerProfile) {
        farmerProfile.earningsSummary += booking.farmId.pricing || 0;
        await farmerProfile.save();
      }
    }

    res.json({ message: `Booking request ${status.toLowerCase()} successfully.`, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating booking status" });
  }
});

module.exports = router;
