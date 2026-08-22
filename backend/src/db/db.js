const mongoose = require("mongoose");

async function connectDB() {
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  console.log("MONGO_URI value (partial):", process.env.MONGO_URI?.slice(0, 20));
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB connection error: ", err);
    throw err;
  }
}

module.exports = connectDB;