const express = require("express");
const router = express.Router()
const path = require("path");
const { verifySession, redirectIfAuthenticated } = require("../middlewares/verifySession");

const app = express();

//  public
router.get("/login", redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "pages", "login.html"));
});

router.get("/register", redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "pages", "register.html"));
});

// Protected: My Account
router.get("/my-account", verifySession, (req, res) => {
  console.log("Session exists for user:", req.session.user);
  // Check if user is admin
  console.log();
  
  if (req.session.user.role === 'Admin') {
    res.sendFile(path.resolve(__dirname, "..", "pages", "admin-account.html"));
  } else {
    res.sendFile(path.resolve(__dirname, "..", "pages", "account.html"));
  }
});

// Protected: Confirm Role Change
router.get("/confirm-role.html", verifySession, (req, res) => {
  if (req.session.user.role !== 'Admin') {
    return res.status(403).json({ message: "Access denied" });
  }
  res.sendFile(path.resolve(__dirname, "..", "pages", "confirm-role.html"));
});

module.exports = router;