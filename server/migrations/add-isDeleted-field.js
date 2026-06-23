const dotenv = require("dotenv")
dotenv.config()
const mongoose = require("mongoose");
const Auth = require("../models/authModel");

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    const result = await Auth.updateMany(
      {
        isDeleted: { $exists: false },
      },
      {
        $set: {
          isDeleted: false,
        },
      },
    );

    console.log("Migration completed");
    console.log(result);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

migrate();
