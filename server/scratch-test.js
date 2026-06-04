const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

async function checkCategories() {
  try {
    const mongoUri = process.env.MONGODB_URL;
    await mongoose.connect(mongoUri);
    const Category = mongoose.connection.db.collection("categories");
    const categories = await Category.find({}).toArray();
    console.log("Categories found:", categories.map(c => ({ id: c._id, name: c.name })));
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkCategories();
