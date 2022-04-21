// This file will handle/control the res of incoming request for auth

// Imports
const User = require("../models/UsersModel");
const Blog = require("../models/BlogModel");
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
      }
      res.json(400).json({ message: "Something went wrong, try again!" });
      return;
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

// Get user data
// http://localhost:8080/api/user/getuser/:id
const getUserData = async (req, res) => {
  // Trycatch for error handling
  try {
    const userId = req.params.id;
    // return in case of no id
    if (!userId) {
      res.status(404).json({ message: "No such user exist" });
      return;
    }

    // get user from db
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      res.status(404).json({ message: "No such user exist" });
      return;
    }

    // if no user found
    if (!user) {
      res.status(404).json({ message: "No such user exist" });
      return;
    }

    // remove password from user data
    const { password, ...others } = user._doc;
    // return data
    res.status(200).json({ others });
    return;
  } catch (error) {
    console.log(error);
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
    return;
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
        const previousImageURL = req.body.userImage;
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        req.body.userImage = req.file.path;
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
        // update blog data
        const updateInBlogs = await Blog.updateMany(
          { authourImageURL: previousImageURL },
          {
            authorName: others.username,
            authourImageURL: others.userImage,
          }
        );
        // remove old image from server
        await fs.unlinkSync(previousImageURL);
        //   send response
        res.status(200).json({ others });
        return;
      }
    } else {
      await fs.unlinkSync(req.file.path);
      res.status(401).json({ message: "Access denied" });
      return;
    }
  } catch (error) {
    await fs.unlinkSync(req.file.path);
    // if duplicate name or email is found
    if (error.code && error.code === 11000) {
      res.status(409).json({ message: "Same username or email exist" });
      return;
    }
    // if invalid id is found
    else if (error.path && error.path === "_id") {
      res.status(404).json({ message: "No such user exist" });
      return;
    } else {
      // unknown reason error
      res.status(500).json({ message: "Internal server error", error: error });
      return;
    }
  }
};

// Delete user data
// http://localhost:8080/api/user/deleteuser/:id
const deleteUserData = async (req, res) => {
  // Trycatch for error handling
  try {
    urlId = req.params.id;
    bodyId = req.body.id;
    console.log(urlId, bodyId);
    if (urlId === bodyId) {
      // check user exist
      let user;
      try {
        user = await User.findById(req.body.id);
      } catch (error) {
        // invalid id
        res.status(404).json({ message: "No such user exist" });
        return;
      }

      //   if user don't exist
      if (!user) {
        res.status(404).json({ message: "No such user exist" });
        return;
      }
      //   delete all posts by user
      await Blog.deleteMany({ username: user.username });
      //   delete user itself
      await User.findByIdAndDelete(req.body.id);
      // delete image
      await fs.unlinkSync(req.body.userImage);
      //   send response
      res.status(200).json({ message: "Account deleted" });
      return;
    } else {
      // id in url and body don't match
      res.status(401).json({ message: "Access denied" });
      return;
    }
  } catch (error) {
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
    return;
  }
};

module.exports = {
  getUserData,
  updateUserData,
  deleteUserData,
  handleFileUpload,
};
