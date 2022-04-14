// This file will handle/control the res of incoming request for auth

// Imports
const User = require("../models/UsersModel");
const Blog = require("../models/BlogModel");
const bcrypt = require("bcrypt");

// Get user data
// http://localhost:8080/api/user/getuser/:id
const getUserData = async (req, res) => {
  // Trycatch for error handling
  try {
    const userId = req.params.id;
    // return in case of no id
    !userId && res.status(404).json({ message: "No such user exist" });

    // get user from db
    const user = await User.findById(userId);

    // if no user found
    !user && res.status(404).json({ message: "No such user exist" });

    // remove password from user data
    const { password, ...others } = user._doc;
    // return data
    res.status(200).json(others);
  } catch (error) {
    console.log(error);
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// Update user data
// http://localhost:8080/api/user/updateuser/:id
const updateUserData = async (req, res) => {
  // Trycatch for error handling
  try {
    urlId = req.params.id;
    bodyId = req.body.id;
    if (urlId === bodyId) {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      //   update user call from mongoose
      const user = await User.findByIdAndUpdate(
        urlId,
        // method to set new data in existing one
        { $set: req.body },
        // return instance of new data
        { new: true }
      );
      //   remove password from user data
      const { password, ...others } = user._doc;
      //   send response
      res.status(200).json(others);
    } else {
      res.status(401).json({ message: "Access denied" });
    }
  } catch (error) {
    console.log(error);
    // if duplicate name or email is found
    if (error.code && error.code === 11000) {
      res.status(409).json({ message: "Same username or email exist" });
    }
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// Delete user data
// http://localhost:8080/api/user/deleteuser/:id
const deleteUserData = async (req, res) => {
  // Trycatch for error handling
  try {
    urlId = req.params.id;
    bodyId = req.body.id;
    if (urlId === bodyId) {
      // check user exist
      const user = await User.findById(req.body.id);
      //   if user don't exist
      !user && res.status(404).json({ message: "No such user exist" });
      //   delete all posts by user
      await Blog.deleteMany({ username: user.username });
      //   delete user itself
      await User.findByIdAndDelete(req.body.id);
      //   send response
      res.status(200).json({ message: "Account deleted" });
    } else {
      // id in url and body don't match
      res.status(401).json({ message: "Access denied" });
    }
  } catch (error) {
    console.log(error);
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

module.exports = {
  getUserData,
  updateUserData,
  deleteUserData,
};
