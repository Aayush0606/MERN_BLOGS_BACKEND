// This file will comtain schema for tags/categories

// Imports
const mongoose = require("mongoose");

// Creting schema
const categoriesSchema = new mongoose.Schema({
  //   Categories name
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// Export current schema
module.exports = mongoose.model("Categories", categoriesSchema);
