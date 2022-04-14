// This file will handle/control the res of incoming request for blogs

// Imports
const Blog = require("../models/BlogModel");

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
      // no blogs from user found
      !authorBlog && res.status(404).json({ message: "No blogs from author" });
      // response
      res.status(200).json(authorBlog);
    } else if (categories) {
      // get blogs from specific categories
      const categoriesBlog = await Blog.find({
        categories: {
          // check for query categories in categories array
          $in: [categories],
        },
      });
      // no blogs from categories found
      !categoriesBlog &&
        res.status(404).json({ message: "No blogs from categories" });
      // response
      res.status(200).json(categoriesBlog);
    } else {
      // get all blogs in DB
      const allBlogs = await Blog.find();
      // no blogs found in DB
      !allBlogs && res.status(404).json({ message: "No blogs exist yet" });
      // response
      res.status(200).json(allBlogs);
    }
  } catch (error) {
    console.log(error);
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// Add new blog(Post request)
// http://localhost:8080/api/blog/new
const addNewBlogData = async (req, res) => {
  try {
    const content = req.body;
    // If empty data is given return
    if (
      !content.title ||
      !content.description ||
      !content.content ||
      !content.blogImage ||
      !content.authorName ||
      !content.categories
    ) {
      // response if no data found
      res.status(400).json({ message: "Please fill all the fields" });
    }
    // creation of Blog schema
    const newBlog = new Blog({
      title: content.title,
      description: content.description,
      content: content.content,
      blogImage: content.blogImage,
      authorName: content.authorName,
      categories: content.categories,
    });
    const addedBlog = await newBlog.save();
    res.status(200).json(addedBlog);
  } catch (error) {
    console.log(error);
    // if duplicate title is found
    if (error.code && error.code === 11000) {
      res.status(409).json({ message: "Title already exist" });
    }
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// Get single blog(Get request)
// http://localhost:8080/api/blog/:id
const getSingleBlogData = async (req, res) => {
  try {
    // find blog by id
    const blogData = await Blog.findById(req.params.id);
    // no blog with such id found
    !blogData && res.status(404).json({ message: "No such blog exist" });
    res.status(200).json(blogData);
  } catch (error) {
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// Delete single blog(Delete request)
// http://localhost:8080/api/blog/delete/:id
const deleteSingleBlogData = async (req, res) => {
  try {
    if (!req.body.authorName) {
      res.status(400).json({ message: "Bad request!" });
    }
    // get blog id from url
    const blogId = req.params.id;
    // get blog details from db
    const blog = await Blog.findById(blogId);
    // if no blog with given id found
    !blog && res.status(404).json({ message: "No such blog exist" });
    // check for same user
    if (blog.authorName === req.body.authorName) {
      const deleteBlog = await Blog.findByIdAndDelete(blogId);
    } else {
      res.status(401).json({ message: "Access denied" });
    }

    // response success
    res.status(200).json({ message: "Deleted successfully" });

    // if both details match
  } catch (error) {
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

// Edit single blog(Put request)
// http://localhost:8080/api/blog/edit/:id
const editSingleBlogData = async (req, res) => {
  try {
    const content = req.body;
    // If empty data is given return
    if (
      !content.title ||
      !content.description ||
      !content.content ||
      !content.blogImage ||
      !content.authorName ||
      !content.categories
    ) {
      // response if no data found
      res.status(400).json({ message: "Please fill all the fields" });
    }
    // get blog id from url
    const blogId = req.params.id;
    // get blog details from db
    const blog = await Blog.findById(blogId);
    // if no blog with given id found
    !blog && res.status(404).json({ message: "No such blog exist" });

    // if both details match
    if (blog.authorName === content.authorName) {
      const updatedData = await Blog.findByIdAndUpdate(
        blogId,
        // method to set new data in existing one
        { $set: req.body },
        // return instance of new data
        { new: true }
      );
      res.status(200).json(updatedData);
    }
    // details don't match
    else {
      res.status(401).json({ message: "Access denied" });
    }
  } catch (error) {
    console.log(error);
    // if duplicate title is found
    if (error.code && error.code === 11000) {
      res.status(409).json({ message: "Title already exist" });
    }
    // unknown reason error
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

module.exports = {
  getSingleBlogData,
  getAllBlogData,
  deleteSingleBlogData,
  editSingleBlogData,
  addNewBlogData,
};
