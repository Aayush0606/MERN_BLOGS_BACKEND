// This file will handle/control the res of incoming request for blogs

// Imports
const Blog = require("../models/BlogModel");
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
    if (
      !req.body.title ||
      !req.body.description ||
      !req.body.content ||
      !req.body.authorName ||
      !req.body.categories
    ) {
      cb(new Error("NOT_ENOUGH_DATA"), false);
    } else {
      cb(
        null,
        req.body.title.replace(/\s/g, "-") + Date.now() + file.originalname
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
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new Error("INVALID_FILE_TYPE"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    // file size (5mb)
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
  // .single for single file upload
}).single("blogImage");

// middleware to handle multer responses
const handleFileUpload = async (req, res, next) => {
  upload(req, res, (error) => {
    // LARGE_FILE_SIZE_ERROR
    if (error instanceof multer.MulterError) {
      res.status(413).json({ message: "File should be under 5mb" });
      return;
    }
    // FILE_FILTER_ERROR
    else if (error) {
      if (error.message === "INVALID_FILE_TYPE") {
        res.status(422).json({ message: "Invalid file type!" });
        return;
      } else if (error.message === "NOT_ENOUGH_DATA") {
        res.status(422).json({ message: "Not enough data!", data: req.body });
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

// Add new blog(Post request)
// http://localhost:8080/api/blog/new
const addNewBlogData = async (req, res) => {
  try {
    // for checking if filetype is not tampered
    const check = async () => {
      const { fileTypeFromFile } = await import("file-type");
      const checkExtension = await fileTypeFromFile(req.file.path);
      const whiteList = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
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
      const content = req.body;
      const blogImage = req.file;
      const newBlog = new Blog({
        title: content.title,
        description: content.description,
        content: content.content,
        blogImage: blogImage.path,
        authorName: content.authorName,
        categories: content.categories,
        authourImageURL: content.authourImageURL,
      });
      const addedBlog = await newBlog.save();
      res.status(200).json({ addedBlog });
      return;
    } else {
      return;
    }
  } catch (error) {
    // delete image as error occured
    await fs.unlinkSync(req.file.path);
    // if duplicate title is found
    if (error.code && error.code === 11000) {
      res.status(409).json({ message: "Title already exist" });
      return;
    } else {
      // unknown reason error
      res.status(500).json({ message: "Internal server error", error: error });
      return;
    }
  }
};

// Get all blog(Get request)
// http://localhost:8080/api/blog
const getAllBlogData = async (req, res) => {
  try {
    // to get all blogs/categories blog/user blog
    // to get author name from url (/blog/?user=xyz)
    const authorName = req.query.user;
    // to get categories from url (/blog/?categories=xyz)
    const categories = req.query.categories;
    if (authorName) {
      // get all blogs by author name
      const authorBlog = await Blog.find({ authorName: authorName });
      // user not found
      if (!authorBlog) {
        res.status(404).json({ message: "No such author!" });
        return;
      }
      // no blogs from user found
      if (authorBlog.length === 0) {
        res.status(404).json({ message: "No blogs from author!" });
        return;
      }
      // response
      res.status(200).json(authorBlog);
      return;
    } else if (categories) {
      // get blogs from specific categories
      const categoriesBlog = await Blog.find({
        categories: {
          // check for query categories in categories array
          $regex: categories,
        },
      });
      //  categories not  found
      if (!categoriesBlog) {
        res.status(404).json({ message: "No such category!" });
        return;
      }
      // no blogs from categories  found
      if (categoriesBlog.length === 0) {
        res.status(404).json({ message: "No blogs from category!" });
        return;
      }
      // response
      res.status(200).json(categoriesBlog);
      return;
    } else {
      // get all blogs in DB
      const allBlogs = await Blog.find();
      // no blogs found in DB
      if (!allBlogs) {
        res.status(404).json({ message: "No blogs exist yet" });
        return;
      }
      // no blogs found in DB
      if (allBlogs.length === 0) {
        res.status(404).json({ message: "No blogs exist yet" });
        return;
      }
      // response
      res.status(200).json(allBlogs);
      return;
    }
  } catch (error) {
    console.log(error);
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
    return;
  }
};

// Get single blog(Get request)
// http://localhost:8080/api/blog/:id
const getSingleBlogData = async (req, res) => {
  try {
    // find blog by id
    const blogData = await Blog.findById(req.params.id);
    // no blog with such id found
    if (!blogData) {
      res.status(404).json({ message: "No such blog exist" });
      return;
    }
    res.status(200).json(blogData);
    return;
  } catch (error) {
    if (error.kind && error.kind === "ObjectId") {
      // invalid id
      res.status(404).json({ message: "No such blog exist" });
      return;
    }
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
    return;
  }
};

// Delete single blog(Delete request)
// http://localhost:8080/api/blog/delete/:id
const deleteSingleBlogData = async (req, res) => {
  try {
    if (!req.body.authorName) {
      res.status(400).json({ message: "Bad request!" });
      return;
    }
    // get blog id from url
    const blogId = req.params.id;
    // get blog details from db
    let blog;
    try {
      blog = await Blog.findById(blogId);
    } catch (error) {
      res.status(404).json({ message: "No such blog exist" });
      return;
    }
    // if no blog with given id found
    if (!blog) {
      res.status(404).json({ message: "No such blog exist" });
    }
    // check for same user
    if (blog.authorName === req.body.authorName) {
      await fs.unlinkSync(req.body.blogImage);
      const deleteBlog = await Blog.findByIdAndDelete(blogId);
      res.status(200).json({ success: true });
      return;
    } else {
      res.status(401).json({ message: "Access denied" });
      return;
    }

    // // response success
    // res.status(200).json({ message: "Deleted successfully" });

    // if both details match
  } catch (error) {
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
    return;
  }
};

// Edit single blog(Put request)
// http://localhost:8080/api/blog/edit/:id
const editSingleBlogData = async (req, res) => {
  try {
    const blogImage = req.file;

    // get blog id from url
    const blogId = req.params.id;
    // get blog details from db
    let blog;
    try {
      blog = await Blog.findById(blogId);
    } catch (error) {
      // invalid blog id
      await fs.unlinkSync(req.file.path);
      res.status(404).json({ message: "No such blog exist" });
      return;
    }
    // if no blog with given id found
    if (!blog) {
      // delete recently saved as no data is found
      await fs.unlinkSync(blogImage.path);
      res.status(404).json({ message: "No such blog exist" });
      return;
    }

    // if both details match
    if (blog.authorName === req.body.authorName) {
      // previous image url
      const prviousImageURL = blog.blogImage;
      // update call to db
      req.body.blogImage = blogImage.path;
      const updatedData = await Blog.findByIdAndUpdate(
        blogId,
        // method to update new data in existing one
        { $set: req.body },
        // return instance of new data
        { new: true }
      );
      // delete old file from system after updating
      await fs.unlinkSync(prviousImageURL);
      res.status(200).json({ addedBlog: updatedData });
      return;
    }
    // details don't match
    else {
      res.status(401).json({ message: "Access denied" });
      return;
    }
  } catch (error) {
    console.log(error);
    // delete image as error occured
    await fs.unlinkSync(req.file.path);
    // if duplicate title is found
    if (error.code && error.code === 11000) {
      res.status(409).json({ message: "Title already exist" });
      return;
    }

    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
    return;
  }
};

module.exports = {
  getSingleBlogData,
  getAllBlogData,
  deleteSingleBlogData,
  editSingleBlogData,
  addNewBlogData,
  handleFileUpload,
};
