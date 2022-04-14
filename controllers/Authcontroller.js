// This file will handle/control the res of incoming request for auth

// Imports
const User = require("../models/UsersModel");
const bcrypt = require("bcrypt");

// Register/Signup new user
// http://localhost:8080/api/auth/register
const registerNewUser = async (req, res) => {
  // Trycatch for error handling
  try {
    const content = req.body;
    // If empty data is given return
    if (
      !content.username ||
      !content.email ||
      !content.password ||
      !content.userImage
    ) {
      // return in case of empty data
      res.status(400).json({ message: "Please fill all the data fields" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(content.password, salt);

    // new user object to insert in DB
    const newUser = new User({
      username: content.username,
      email: content.email,
      password: hashedPassword,
      userImage: content.userImage,
    });

    // insertion in db
    const user = await newUser.save();
    const { password, ...others } = user._doc;

    // response
    res.status(200).json({ others, message: "Account created!" });
  } catch (error) {
    console.log(error);
    // if duplicate name or email is found
    if (error.code && error.code === 11000) {
      res.status(409).json({ message: "Same email or username exist!" });
    }
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// Login an existing user(Get request)
// http://localhost:8080/api/auth/login
const loginNewUser = async (req, res) => {
  // Trycatch for error handling
  try {
    const content = req.body;
    // If empty data is given return
    if (!content.email || !content.password) {
      // return in case of empty data
      res.status(400).json({ message: "Please fill all the data fields" });
    }

    // fetch requested user data
    const user = await User.findOne({ email: req.body.email });

    // if no user found
    !user && res.status(400).json({ message: "Invalid Credentials" });

    // check password hash by encrypting the given password
    const checkPassword = await bcrypt.compare(content.password, user.password);

    // password not matched
    !checkPassword && res.status(400).json({ message: "Invalid Credentials" });

    // break password and rest of the fiels into different category
    const { password, ...others } = user._doc;

    // send user details back
    res.status(200).json({ others, message: "Login successful!" });
  } catch (error) {
    console.log(error);
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

module.exports = {
  registerNewUser,
  loginNewUser,
};
