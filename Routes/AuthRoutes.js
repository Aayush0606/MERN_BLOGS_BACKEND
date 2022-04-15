// This file will contain all routes requested by auth call and will send the request to apppropriate controller

// Imports
const express = require("express");
const dotenv = require("dotenv").config();
const {
  registerNewUser,
  loginNewUser,
  handleFileUpload,
} = require("../controllers/Authcontroller");

// Mandatory setup
const router = express.Router();

// Routes

// Register/Signup new user(Post request)
// http://localhost:8080/api/auth/register
router.post("/register", handleFileUpload, registerNewUser);

// Login an existing user(Post request)
// http://localhost:8080/api/auth/login
router.post("/login", loginNewUser);

// Mandatory setup
module.exports = router;
