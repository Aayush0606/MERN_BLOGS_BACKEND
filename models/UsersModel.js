// This file will comtain schema for users

// Imports
const mongoose = require("mongoose");

// Creting schema
const userSchema = new mongoose.Schema(
  {
    //   Username
    username: {
      type: String,
      required: true,
      unique: true,
    },
    // User emrail
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // User password
    password: {
      type: String,
      required: true,
    },
    // User profile picture(default if not given)
    userImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Export current schema
module.exports = mongoose.model("User", userSchema);
