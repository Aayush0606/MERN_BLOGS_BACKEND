// This file will handle/control the res of incoming request for categories

// Imports
const Categories = require("../models/CategoriesModel");

// Add new categories
// http://localhost:8080/api/categories/add
const addNewCategories = async (req, res) => {
  // Trycatch for error handling
  try {
    //   create category schema
    const saveCategory = new Categories(req.body);
    // save in db
    const data = await saveCategory.save();
    // send response
    res.status(200).json({ data, message: "Category created" });
    return;
  } catch (error) {
    console.log(error);
    // if duplicate category is found
    if (error.code && error.code === 11000) {
      res.status(200).json({ message: "Category created" });
      return;
    } else {
      // unknown reason error
      res.status(500).json({ message: "Internal server error", error: error });
    }
  }
};

// Get all categories
// http://localhost:8080/api/categories/
const getAllCategories = async (req, res) => {
  // Trycatch for error handling
  try {
    // get all category
    const allCategories = await Categories.find();
    // send response
    res.status(200).json(allCategories);
    return;
  } catch (error) {
    console.log(error);
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
    return;
  }
};

module.exports = {
  addNewCategories,
  getAllCategories,
};
