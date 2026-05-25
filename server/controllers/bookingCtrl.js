const Booking = require("../models/BookingModel");
const Property = require("../models/propertyModel");
const AuditLogs = require("../models/auditLogs");
const RewardSettings = require("../models/rewardSettingsModel");
const RewardPoints = require("../models/rewardPointsModel");
const RewardHistory = require("../models/rewardHistoryModel");
const Auth = require("../models/authModel");

exports.createBookingCtrl = async (req, res) => {
    try {
        const { service, user, date, time, notes, address, payment } = req.body;

        if (!service || !user || !date) {
            return res.status(400).json({
                success: false,
                message: "Service, user, and date are required.",
            });
        }

        // Validate address if provided
        if (address && !address.addressLine1) {
            return res.status(400).json({
                success: false,
                message: "Address Line 1 is required when address is provided.",
            });
        }

        const booking = await Booking.create({
            service,
            user,
            date,
            time,
            notes,
            address,
            payment,
        });

        // Get service details for audit log
        const serviceDetails = await Property.findById(service).populate('vendor');

        // Create audit log for booking
        try {
            await AuditLogs.create({
                userId: user,
                propertyId: service,
                type: "booking",
                details: {
                    bookingId: booking._id,
                    serviceName: serviceDetails?.title,
                    vendorName: serviceDetails?.vendor?.name,
                    bookingDate: date,
                    bookingTime: time,
                    notes: notes,
                    address: address ? `${address.addressLine1}, ${address.city}, ${address.state}` : null,
                    paymentAmount: payment?.amount,
                    paymentMethod: payment?.paymentMethod,
                    bookingType: "service_booking"
                }
            });
            console.log('Booking audit log created successfully');
        } catch (auditError) {
            console.error('Failed to create booking audit log:', auditError);
        }

        // Award booking reward points to user
        try {
            const rewardSettings = await RewardSettings.findOne();

            if (rewardSettings && rewardSettings.isActive && rewardSettings.bookingPoints > 0) {

                // Get or create reward points record
                let userRewardPoints = await RewardPoints.findOne({ userId: user });

                if (!userRewardPoints) {
                    userRewardPoints = await RewardPoints.create({
                        userId: user,
                        totalPoints: 0,
                        availablePoints: 0,
                    });
                }

                // Add booking points
                const pointsToAdd = rewardSettings.bookingPoints;
                userRewardPoints.totalPoints += pointsToAdd;
                userRewardPoints.availablePoints += pointsToAdd;
                await userRewardPoints.save();

                // Create reward history entry
                await RewardHistory.create({
                    userId: user,
                    type: "credit",
                    source: "booking",
                    points: pointsToAdd,
                    description: `Booking reward for service: ${serviceDetails?.title || 'Service'}`,
                    referenceId: booking._id,
                    referenceModel: "Booking",
                    balanceAfter: userRewardPoints.availablePoints,
                });

            } else {
                console.log('ℹ️ Booking rewards not active or not configured');
            }
        } catch (rewardError) {
            console.error('❌ Failed to process booking reward:', rewardError);
            // Don't fail the booking if reward fails
        }

        res.status(201).json({
            success: true,
            message: "Booking created successfully.",
            booking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating booking.",
            error: error.message,
        });
    }
};

// ✅ Get All Bookings
exports.getAllBookingsCtrl = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const search = req.query.search;

        let filterConditions = {};

        // Only fetch bookings for services belonging to existing active vendors (name exists, non-empty, and non-null)
        const Vendor = require("../models/vendorModel");
        const activeVendors = await Vendor.find({ name: { $exists: true, $ne: "", $ne: null } }).select("_id");
        const activeVendorIds = activeVendors.map(v => v._id);

        const activeProperties = await Property.find({ vendor: { $in: activeVendorIds } }).select("_id");
        const activePropertyIds = activeProperties.map(p => p._id);

        filterConditions.service = { $in: activePropertyIds };

        // Status filter
        if (status && status !== "all") {
            filterConditions.status = status;
        }

        // Search filter across Populated Fields
        if (search) {
            const mongoose = require("mongoose");
            const isValidObjectId = mongoose.Types.ObjectId.isValid(search);
            const Vendor = require("../models/vendorModel");

            // Find users matching search term
            let userSearchQuery = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } }
                ]
            };
            if (isValidObjectId) {
                userSearchQuery.$or.push({ _id: search });
            }
            const matchingUsers = await Auth.find(userSearchQuery).select("_id");
            const userIds = matchingUsers.map(u => u._id);

            // Find vendors matching search term
            let vendorSearchQuery = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                    { company: { $regex: search, $options: "i" } }
                ]
            };
            if (isValidObjectId) {
                vendorSearchQuery.$or.push({ _id: search });
            }
            const matchingVendors = await Vendor.find(vendorSearchQuery).select("_id");
            const vendorIds = matchingVendors.map(v => v._id);

            // Find categories matching search term
            const Category = require("../models/categoryModel");
            const matchingCategories = await Category.find({
                name: { $regex: search, $options: "i" }
            }).select("_id");
            const categoryIds = matchingCategories.map(c => c._id);

            // Find properties matching search term or matching vendors/categories
            let propertySearchQuery = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { location: { $regex: search, $options: "i" } },
                    { vendor: { $in: vendorIds } },
                    { category: { $in: categoryIds } }
                ]
            };
            if (isValidObjectId) {
                propertySearchQuery.$or.push({ _id: search });
                propertySearchQuery.$or.push({ vendor: search });
                propertySearchQuery.$or.push({ category: search });
            }
            const matchingProperties = await Property.find(propertySearchQuery).select("_id");
            const propertyIds = matchingProperties.map(p => p._id);

            filterConditions.$or = [
                { user: { $in: userIds } },
                { service: { $in: propertyIds } },
                { notes: { $regex: search, $options: "i" } },
                { "address.addressLine1": { $regex: search, $options: "i" } },
                { "address.city": { $regex: search, $options: "i" } },
                { "payment.transactionId": { $regex: search, $options: "i" } }
            ];

            if (isValidObjectId) {
                filterConditions.$or.push({ _id: search });
            }
        }

        if (page) {
            const skip = (page - 1) * limit;
            const total = await Booking.countDocuments(filterConditions);
            const bookings = await Booking.find(filterConditions)
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "service", // Property model
                    populate: { path: "vendor", model: "Vendor" }, // optional if vendor inside property
                })
                .populate({
                    path: "user",
                    model: "auth",
                    select: "name email phone"
                }); // full user details

            res.status(200).json({
                success: true,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                bookings,
            });
        } else {
            const bookings = await Booking.find(filterConditions)
                .populate({
                    path: "service", // Property model
                    populate: { path: "vendor", model: "Vendor" }, // optional if vendor inside property
                })
                .populate({
                    path: "user",
                    model: "auth",
                    select: "name email phone"
                }); // full user details

            res.status(200).json({
                success: true,
                total: bookings.length,
                bookings,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching bookings.",
            error: error.message,
        });
    }
};


exports.getBookingsByVendorCtrl = async (req, res) => {
    try {
        const { vendorId } = req.params;

        // 🔹 Get all property IDs for this vendor
        const vendorProperties = await Property.find({ vendor: vendorId }).select("_id");
        const propertyIds = vendorProperties.map((p) => p._id);

        if (!propertyIds.length) {
            return res.status(404).json({
                success: false,
                message: "No Service found for this Partner.",
            });
        }

        // 🔹 Get all bookings where service is one of vendor's properties
        const bookings = await Booking.find({ service: { $in: propertyIds } })
            .populate({
                path: "service",
                select: "title price location images vendor",
            })
            .populate({
                path: "user",
                model: "auth",
                select: "name email phone",
            });

        // Debug log to check user population

        if (!bookings.length) {
            return res.status(404).json({
                success: false,
                message: "No bookings found for this vendor.",
            });
        }

        res.status(200).json({
            success: true,
            total: bookings.length,
            bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching vendor bookings.",
            error: error.message,
        });
    }
};


exports.updateBookingStatusCtrl = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        // 🔹 Validate status
        const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
            });
        }

        // 🔹 Find booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // 🔹 Update status
        booking.status = status;

        // 🔹 If completed, update payment
        if (status === "completed") {
            booking.payment.paymentStatus = "success";
            booking.payment.paymentType = "cash";
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            booking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating booking status",
            error: error.message,
        });
    }
};