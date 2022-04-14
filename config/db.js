// Mandatory setup
// For initalizing and running database

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connector = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Mongo DB server started at - ${connector.connection.host}:${connector.connection.port}`
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
