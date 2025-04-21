const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken"); // Add JWT for token generation
const {
  User,
  validateLoginUser,
  validateRegisterUser,
} = require("../models/user");

// Configure rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
});

/**
 * @desc  Register New User
 * @route /api/auth/register
 * @method post
 * @access public
 *
 **/
router.post("/register", async (req, res) => {
  // Validation
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  // Querying DB
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: "This user already exists" });
    }

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    // Create new user
    user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      // role: req.body.role || false,
    });

    // Save user to DB
    const result = await user.save();
    // Store user info in session (excluding password)
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };
    console.log("Session after register:", req.session.user);
    const { password, ...userData } = user._doc;

    // Send response and redirect to /my-account
    res.status(200).json({
      message: "register successful",
      user: userData,
      redirectTo: "/my-account",
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

/**
 * @desc  Login
 * @route /api/auth/login
 * @method post
 * @access public
 *
 **/
// Login route
router.post("/login", async (req, res) => {
  // Validation
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  // Querying DB
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Store user info in session (excluding password)
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };
    console.log("Session after login:", req.session.user);
    const { password, ...userData } = user._doc;

    // Send response and redirect to /my-account
    res.status(200).json({
      message: "Login successful",
      user: userData,
      redirectTo: "/my-account",
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

/**
 * @desc  Upgrade user
 * @route /api/auth/upgradeUser
 * @method post
 * @access private
 *
 **/
router.post("/upgradeUser", async (req, res) => {
  const { username, action, confirmed } = req.body;
  // vaunrable
  if (!confirmed && (!req.session?.user || req.session.user.role !== "Admin")) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  if (!username && !action) {
    return res.status(400).json({ message: "Please select a user." });
  }

  // serve confirmation page
  if (!confirmed) {
    return res.render("confirm-role", {
      username,
      role: "Admin",
    });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User does not exist." });
    }

    user.role = "Admin";
    const result = await user.save();

    return res.status(200).json({
      message: "User upgraded successfully.",
      user: {
        id: result._id,
        username: result.username,
        newRole: result.role,
      },
    });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
});

/**
 * @desc  downGrade user
 * @route /api/auth/upgradeUser
 * @method post
 * @access private
 *
 **/
router.post("/downGradeUser", async (req, res) => {
  const { username, action } = req.body;
  console.log(`${username},${userId},${action}`);

  if (!req.session?.user || req.session.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  if (!username  && !action) {
    return res.status(400).json({ message: "Please select a user." });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User does not exist." });
    }

    user.role = "User";
    const result = await user.save();

    return res.status(200).json({
      message: "User downGraded successfully.",
      user: {
        id: result._id,
        username: result.username,
        newRole: result.role,
      },
    });
  } catch (error) {
    console.error("Error downGrading user:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
});



/**
 * @desc  Logout
 * @route /api/auth/logout
 * @method get
 * @access private
 *
 **/
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({
      redirectTo: "/login",
    });
  });
});

module.exports = router;
