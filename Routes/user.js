const express = require("express");
const router = express.Router();
const {User} = require("../models/user");

/**
 * @desc  Get Current User
 * @route /api/user/me
 * @method get
 * @access private
 *
 **/
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  res.status(200).json({
    user: req.session.user
  });
});

/**
 * @desc  Get All Users (Admin only)
 * @route /api/user/users
 * @method get
 * @access private (admin only)
 *
 **/
router.get("/users", async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'Admin') {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

/**
 * @desc  Delete User (Admin only)
 * @route /api/user/users/:id
 * @method delete
 * @access private (admin only)
 *
 **/
router.delete("/users/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'Admin') {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

/**
 * @desc  Update User Role (Admin only)
 * @route /api/user/users/:id/role
 * @method put
 * @access private (admin only)
 *
 **/
router.put("/users/:id/role", async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'Admin') {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update role
    user.role = req.body.role;
    await user.save();

    res.status(200).json({ 
      message: "User role updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

module.exports = router; 