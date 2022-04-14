// This file will contain all routes requested by category call and will send the request to apppropriate controller

// Imports
const express = require("express");
const dotenv = require("dotenv").config();
const {
  addNewCategories,
  getAllCategories,
} = require("../controllers/Categoriescontroller");

// Mandatory setup
const router = express.Router();

// Routes

// Get all categories(Get request)
// http://localhost:8080/api/categories/
router.get("/", getAllCategories);

// Add new categories(Post request)
// http://localhost:8080/api/categories/add
router.post("/add", addNewCategories);

// Mandatory setup
module.exports = router;
