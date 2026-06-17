const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const authMiddleware = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST api/auth/signup
// @desc    Register user (Customer or Farmer)
router.post("/signup", async (req, res) => {
  const { name, email, password, role, contactNumber, locationName, lat, lng, farmName, farmDescription, farmAddress, farmCategory } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save User
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "Customer",
      contactNumber: contactNumber || "",
      locationName: locationName || "",
      lat: lat || null,
      lng: lng || null,
      otpCode: otp,
      otpExpires,
      otpVerified: false,
    });

    await user.save();

    // If role is Farmer, create Farmer profile
    if (role === "Farmer") {
      const farmer = new Farmer({
        userId: user._id,
        farmName: farmName || "My Farm",
        farmDescription: farmDescription || "",
        farmAddress: farmAddress || locationName || "",
        farmCategory: farmCategory || "Vegetables",
        verificationStatus: "Pending",
      });
      await farmer.save();
    }

    // Send OTP Email
    await sendEmail({
      to: email,
      subject: "Farmify - Email Verification OTP",
      text: `Your Farmify verification OTP is ${otp}. It will expire in 5 minutes.`,
      html: `<h3>Welcome to Farmify!</h3><p>Your email verification OTP is <b>${otp}</b>.</p><p>This OTP will expire in 5 minutes.</p>`,
    });

    res.status(201).json({
      message: "Registration successful. OTP sent to your email.",
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @route   POST api/auth/verify-otp
// @desc    Verify OTP for account activation
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Check expiration
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    // Verify account
    user.otpVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Account verified successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
});

// @route   POST api/auth/resend-otp
// @desc    Resend OTP email
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: "Farmify - Resend Email Verification OTP",
      text: `Your new Farmify verification OTP is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your new verification OTP is <b>${otp}</b>.</p>`,
    });

    res.json({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while resending OTP" });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token (supports Farmer, Customer, Admin)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Admin Credential Fallback
    if (email === "admin" || email === "admin@farmify.com") {
      if (password === "admin123") {
        const payload = {
          id: "admin_id",
          name: "Administrator",
          email: "admin@farmify.com",
          role: "Admin",
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || "supersecretfarmifykey123", {
          expiresIn: "1d",
        });
        return res.json({
          token,
          user: {
            id: "admin_id",
            name: "Administrator",
            email: "admin@farmify.com",
            role: "Admin",
          },
        });
      } else {
        return res.status(400).json({ message: "Invalid Admin Credentials" });
      }
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if OTP verified
    if (!user.otpVerified) {
      return res.status(403).json({
        message: "Please verify your email OTP before logging in",
        notVerified: true,
        email: user.email,
      });
    }

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked. Please contact support." });
    }

    // Create JWT
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "supersecretfarmifykey123", {
      expiresIn: "7d",
    });

    let farmerProfile = null;
    if (user.role === "Farmer") {
      farmerProfile = await Farmer.findOne({ userId: user._id });
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
        locationName: user.locationName,
        lat: user.lat,
        lng: user.lng,
        profilePicture: user.profilePicture,
        farmerProfile,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiration for password reset
    await user.save();

    await sendEmail({
      to: email,
      subject: "Farmify - Password Reset OTP",
      text: `Your password reset verification code is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your password reset code is <b>${otp}</b>.</p>`,
    });

    res.json({ message: "Password reset code sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during password reset request" });
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password using OTP
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during password reset" });
  }
});

// @route   GET api/auth/profile
// @desc    Get current user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      return res.json({
        id: "admin_id",
        name: "Administrator",
        email: "admin@farmify.com",
        role: "Admin",
      });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let farmerProfile = null;
    if (user.role === "Farmer") {
      farmerProfile = await Farmer.findOne({ userId: user._id });
    }

    res.json({ user, farmerProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// @route   PUT api/auth/profile
// @desc    Update profile details
router.put("/profile", authMiddleware, async (req, res) => {
  const { name, contactNumber, locationName, lat, lng, profilePicture, farmName, farmDescription, farmAddress, farmCategory } = req.body;

  try {
    if (req.user.role === "Admin") {
      return res.status(400).json({ message: "Cannot edit Admin profile details via this route" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic user details
    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (locationName) user.locationName = locationName;
    if (lat !== undefined) user.lat = lat;
    if (lng !== undefined) user.lng = lng;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    let farmerProfile = null;
    if (user.role === "Farmer") {
      farmerProfile = await Farmer.findOne({ userId: user._id });
      if (farmerProfile) {
        if (farmName) farmerProfile.farmName = farmName;
        if (farmDescription) farmerProfile.farmDescription = farmDescription;
        if (farmAddress) farmerProfile.farmAddress = farmAddress;
        if (farmCategory) farmerProfile.farmCategory = farmCategory;
        if (req.body.certificate) farmerProfile.certificate = req.body.certificate;
        if (req.body.certificateId) farmerProfile.certificateId = req.body.certificateId;
        if (req.body.certificate || req.body.certificateId) {
          farmerProfile.verificationStatus = "Pending";
        }
        await farmerProfile.save();
      }
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
        locationName: user.locationName,
        lat: user.lat,
        lng: user.lng,
        profilePicture: user.profilePicture,
        farmerProfile,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

// @route   POST api/auth/change-password
// @desc    Change user password
router.post("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    if (req.user.role === "Admin") {
      return res.status(400).json({ message: "Admin password cannot be changed" });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while changing password" });
  }
});

module.exports = router;
