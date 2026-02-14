const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property", // linked to your Property model
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth", // linked to your Auth model
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        
        // 🔹 Service Address
        address: {
            addressLine1: {
                type: String,
                required: true,
                trim: true,
            },
            city: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            zipCode: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                trim: true,
            },
            // 🔹 GPS Coordinates
            coordinates: {
                latitude: {
                    type: Number,
                },
                longitude: {
                    type: Number,
                },
            },
        },
        
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending",
        },

        // 🔹 Payment Details
        payment: {
            transactionId: {
                type: String,
                trim: true,
            },
            paymentType: {
                type: String,
                enum: ["online", "cash", "upi", "card"],
                default: "online",
            },
            paymentStatus: {
                type: String,
                enum: ["pending", "success", "failed"],
                default: "pending",
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
