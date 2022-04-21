// This file will handle/control the res of incoming request for auth

// Imports
const User = require("../models/UsersModel");
const bcrypt = require("bcrypt");
const fs = require("fs");
const multer = require("multer");
// Middlewares

// Upload route
// multer setup
//  multer: what to do with file
const storage = multer.diskStorage({
  // where to store file
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  // file name (file.originalname=file name that user have)
  filename: (req, file, cb) => {
    // NOT_ENOUGH_DATA
    if (!req.body.username || !req.body.email || !req.body.password) {
      cb(new Error("NOT_ENOUGH_DATA"), false);
    } else {
      cb(
        null,
        req.body.username.replace(/\s/g, "-") + Date.now() + file.originalname
      );
    }
  },
});

// multer:for filtering bad file requests
const fileFilter = (req, file, cb) => {
  // supported types
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("INVALID_FILE_TYPE"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    // file size (2mb)
    fileSize: 1024 * 1024 * 2,
  },
  fileFilter: fileFilter,
  // .single for single file upload
}).single("userImage");

// middleware to handle multer responses
const handleFileUpload = async (req, res, next) => {
  upload(req, res, (error) => {
    // LARGE_FILE_SIZE_ERROR
    if (error instanceof multer.MulterError) {
      res.status(413).json({ message: "File should be under 2MB" });
      return;
    }
    // FILE_FILTER_ERROR
    else if (error) {
      if (error.message === "INVALID_FILE_TYPE") {
        res.status(422).json({ message: "Invalid file type!" });
        return;
      } else if (error.message === "NOT_ENOUGH_DATA") {
        res.status(422).json({ message: "Not enough data!" });
        return;
      } else {
        res.json(400).json({ message: "Something went wrong, try again!" });
        return;
      }
    }
    // NO_FILE_FOUND_ERROR
    else if (!req.file) {
      res.status(400).json({ message: "File is required!" });
      return;
    } else {
      // calling next midlleware
      next();
    }
  });
};

// Main routes

// Register/Signup new user
// http://localhost:8080/api/auth/register
const registerNewUser = async (req, res) => {
  // Trycatch for error handling
  try {
    // for checking if filetype is not tampered
    const check = async () => {
      const { fileTypeFromFile } = await import("file-type");
      const checkExtension = await fileTypeFromFile(req.file.path);
      const whiteList = ["image/jpeg", "image/png", "image/jpg"];
      if (
        checkExtension === undefined ||
        !whiteList.includes(checkExtension.mime)
      ) {
        await fs.unlinkSync(req.file.path);
        res.status(422).json({ message: "Invalid file type!" });
        return false;
      }
      return true;
    };
    let isValid = await check();
    if (isValid) {
      // hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // new user object to insert in DB
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        userImage: req.file.path,
      });

      // insertion in db
      const user = await newUser.save();
      const { password, ...others } = user._doc;

      // response
      res.status(200).json({ status: 200, message: "Account created!" });
      return;
    } else {
      return;
    }
    console.log(req.res);
  } catch (error) {
    // delete file as error occured
    await fs.unlinkSync(req.file.path);

    // if duplicate name or email is found
    if (error.code && error.code === 11000) {
      res.status(409).json({
        // which category conflicts(username/email)
        message: `Same ${Object.keys(error.keyValue)[0]} exist!`,
      });
      return;
    }
    // unknown reason error
    console.log(error);
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
      return;
    }

    // fetch requested user data
    let user;
    try {
      user = await User.findOne({ email: req.body.email });
    } catch (err) {
      res.status(400).json({ message: "Invalid Credentials" });
      return;
    }

    // if no user found
    if (!user) {
      res.status(400).json({ message: "Invalid Credentials" });
      return;
    }

    // check password hash by encrypting the given password
    const checkPassword = await bcrypt.compare(content.password, user.password);

    // password not matched
    if (!checkPassword) {
      res.status(400).json({ message: "Invalid Credentials" });
      return;
    }

    // break password and rest of the fiels into different category
    const { password, ...others } = user._doc;

    // send user details back
    res.status(200).json({ others, message: "Login successful!" });
    return;
  } catch (error) {
    console.log(error);
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
    return;
  }
};

module.exports = {
  registerNewUser,
  loginNewUser,
  handleFileUpload,
};
