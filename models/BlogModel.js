// This file will comtain schema for blogs

// Imports
const mongoose = require("mongoose");

// Creting schema
const blogSchema = new mongoose.Schema(
  {
    //   Blog title
    title: {
      type: String,
      required: true,
      unique: true,
    },
    // Blog description
    description: {
      type: String,
      required: true,
    },
    // Blog content
    content: {
      type: String,
      required: true,
    },
    // Blog thumbnail (default if not given)
    blogImage: {
      type: String,
      required: true,
    },
    // Blog author name
    authorName: {
      type: String,
      required: true,
    },
    // // Blog author id
    authourImageURL: {
      type: String,
      required: true,
    },
    // Blog tags
    categories: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Export current schema
module.exports = mongoose.model("Blog", blogSchema);
