const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/auth");

// @route   GET api/notifications
// @desc    Get all notifications for current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching notifications" });
  }
});

// @route   PUT api/notifications/read
// @desc    Mark all notifications as read
router.put("/read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ receiverId: req.user.id, readStatus: false }, { readStatus: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating notifications" });
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark single notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.readStatus = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating notification" });
  }
});

// @route   DELETE api/notifications
// @desc    Clear all notifications for current user
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ receiverId: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while clearing notifications" });
  }
});

module.exports = router;
