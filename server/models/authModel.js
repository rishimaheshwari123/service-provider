const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
        },
        password: {
            type: String,
            trim: true,
        },


        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        token: {
            type: String,
        },
        type: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("auth", authSchema);
