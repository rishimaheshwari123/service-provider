const Booking = require("../models/BookingModel");
const Property = require("../models/propertyModel");
const AuditLogs = require("../models/auditLogs");

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
        const bookings = await Booking.find()
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
        console.log("Sample booking user data:", bookings[0]?.user);

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