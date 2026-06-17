const express = require("express");
const router = express.Router();
const Farm = require("../models/Farm");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");

// @route   POST api/chatbot
// @desc    Process chatbot message and return dynamic assistance
router.post("/", authMiddleware, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const text = message.toLowerCase();
    let reply = "";
    let recommendedFarms = [];
    let bookingInfo = null;

    // 1. Check for recommendation intent
    if (
      text.includes("recommend") ||
      text.includes("suggest") ||
      text.includes("find") ||
      text.includes("search") ||
      text.includes("organic") ||
      text.includes("show farms") ||
      text.includes("near") ||
      text.includes("vegetables") ||
      text.includes("dairy") ||
      text.includes("rice")
    ) {
      // Find matches in categories, names, or addresses
      let dbQuery = { availability: true };

      if (text.includes("vegetable")) {
        dbQuery.category = { $regex: "vegetable|organic", $options: "i" };
      } else if (text.includes("dairy") || text.includes("milk")) {
        dbQuery.category = { $regex: "dairy|milk|cow", $options: "i" };
      } else if (text.includes("rice") || text.includes("paddy")) {
        dbQuery.category = { $regex: "rice|paddy", $options: "i" };
      }

      // Query farms
      recommendedFarms = await Farm.find(dbQuery).limit(3);

      if (recommendedFarms.length > 0) {
        reply = "Here are some top-rated organic farms I found matching your request. You can tap on any card to view details and book a visit!";
      } else {
        // Fallback to general farms
        recommendedFarms = await Farm.find({ availability: true }).limit(3);
        if (recommendedFarms.length > 0) {
          reply = "I couldn't find a direct match, but here are some organic farms available nearby that you might like:";
        } else {
          reply = "Currently there are no farms registered or approved. Please check back later!";
        }
      }
    }
    // 2. Check for booking assistance intent
    else if (
      text.includes("booking") ||
      text.includes("my visit") ||
      text.includes("status") ||
      text.includes("appointment") ||
      text.includes("scheduled")
    ) {
      if (req.user.role === "Customer") {
        const bookings = await Booking.find({ customerId: req.user.id })
          .populate("farmId", "farmName address")
          .sort({ createdAt: -1 })
          .limit(1);

        if (bookings.length > 0) {
          const latest = bookings[0];
          bookingInfo = latest;
          reply = `I found your most recent booking for ${latest.farmId.farmName}. The current status is **${latest.bookingStatus}**. It is scheduled for ${new Date(latest.bookingDate).toDateString()} at ${latest.bookingTime}.`;
        } else {
          reply = "You don't have any farm visit bookings yet. You can search for farms on the home page and press 'Book Farm Visit'!";
        }
      } else if (req.user.role === "Farmer") {
        const bookings = await Booking.find({ farmerId: req.user.id, bookingStatus: "Pending" })
          .populate("farmId", "farmName")
          .populate("customerId", "name")
          .sort({ createdAt: -1 });

        if (bookings.length > 0) {
          reply = `You have **${bookings.length} pending visit requests** from customers waiting for your approval. You can view them on your profile under Upcoming Visits.`;
        } else {
          reply = "You don't have any pending booking requests at the moment. Keep your farm details updated to attract more visitors!";
        }
      }
    }
    // 3. General support replies
    else {
      reply = `Hello ${req.user.name}! I am your Farmify AI Assistant. How can I help you today?
      
You can ask me to:
- **Recommend organic farms** (e.g., "suggest some vegetable farms")
- **Check your booking status** (e.g., "what is the status of my booking?")
- **Explain Farmify** (e.g., "how can I book a farm visit?")`;
    }

    res.json({
      reply,
      farms: recommendedFarms,
      booking: bookingInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error in chatbot engine" });
  }
});

module.exports = router;
