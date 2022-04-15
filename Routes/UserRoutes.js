// This file will contain all routes requested by user call and will send the request to apppropriate controller

// Imports
const express = require("express");
const dotenv = require("dotenv").config();
const {
  getUserData,
  updateUserData,
  deleteUserData,
  handleFileUpload,
} = require("../controllers/Usercontroller");

// Mandatory setup
const router = express.Router();

// Routes

// Get user data(Get request)
// http://localhost:8080/api/user/getuser/:id
router.get("/getuser/:id", getUserData);

// Update user data(Put request)
// http://localhost:8080/api/user/updateuser/:id
router.put("/updateuser/:id", handleFileUpload, updateUserData);

// Delete user data
// http://localhost:8080/api/user/deleteuser/:id
router.delete("/deleteuser/:id", deleteUserData);

// Mandatory setup
module.exports = router;
