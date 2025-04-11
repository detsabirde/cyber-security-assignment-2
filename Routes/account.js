const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  User,
  validateLoginUser,
  validateRegisterUser,
} = require("../models/user");
const { route } = require("./authV");

/**
 * @desc  Register New User
 * @route /api/auth/register
 * @method Get
 * @access public
 *
 **/
router.use("/", async (req, res) => {
  return res.status(200);
});
