// Imports
const express = require("express");
const dotenv = require("dotenv").config();
const BlogRoutes = require("./Routes/BlogRoutes");
const AuthRoutes = require("./Routes/AuthRoutes");
const UserRoutes = require("./Routes/UserRoutes");
const CategoriesRoutes = require("./Routes/CategoriesRoutes");
const connectDB = require("./config/db");
const cors = require("cors");

// Mandatory setup
const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static("images"));
app.use(cors());

// Routes callbacks

// Auth routes
app.use("/api/auth", AuthRoutes);

// Blogs route
app.use("/api/blog", BlogRoutes);

// User route
app.use("/api/user", UserRoutes);

// Categories route
app.use("/api/categories", CategoriesRoutes);

// Server start after DB is ready
connectDB().then(() =>
  app.listen(port, () => console.log(`server started at port-${port}`))
);
