const Contact = require("../models/contactModel");
const AuditLogs = require("../models/auditLogs");
const mailSender = require("../utils/mailSender");
const {
  contactInquiryTemplate,
  generalContactTemplate,
} = require("../utils/emailTemplates");
const createSystemLog = require("../utils/auditLogger");

const createContactCtrl = async (req, res) => {
  try {
    const { name, email, phone, message, property, user } = req.body;

    if (!name || !phone || !property) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const vendor = property.vendor;

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
      vendor,
      property,
      user,
    });

    await newContact.save();

    // Create audit log for service inquiry
    try {
      await AuditLogs.create({
        userId: user || null,
        propertyId: property._id,
        type: "inquiry",
        details: {
          contactId: newContact._id,
          serviceName: property.title,
          vendorName: vendor?.name,
          inquiryType: "service_inquiry",
        },
        userInfo: {
          name,
          email,
          phone,
        },
      });
      console.log("Service inquiry audit log created successfully");
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
    }

    // Send email notification to admin
    try {
      const emailData = {
        name,
        email,
        phone,
        message,
        property,
        vendor,
      };

      const emailBody = contactInquiryTemplate(emailData);
      const emailTitle = `🔔 New Service Inquiry from ${name}`;

      // Send to admin email
      await mailSender(process.env.ADMIN_EMAIL, emailTitle, emailBody);

      console.log("Email notification sent successfully to admin");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Contact created successfully.",
      newContact,
    });
  } catch (error) {
    console.error("Create Contact Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error while creating contact." });
  }
};

const createGeneralContactCtrl = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, subject, and message are required." });
    }

    // Create audit log for general contact

    // Send email notification to admin
    try {
      const emailData = {
        name,
        email,
        phone,
        subject,
        message,
      };

      const emailBody = generalContactTemplate(emailData);
      const emailTitle = `📧 New Contact Form: ${subject}`;

      // Send to admin email
      await mailSender(process.env.ADMIN_EMAIL, emailTitle, emailBody);

      console.log("General contact email sent successfully to admin");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to send email." });
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We will get back to you soon.",
    });
  } catch (error) {
    console.error("General Contact Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error while sending message." });
  }
};

const getContactsByVendorCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    const contacts = await Contact.find({ vendor: id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, contacts });
  } catch (error) {
    console.error("Get Contacts Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error while fetching contacts." });
  }
};

const getUserInquiryByIdCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    const contacts = await Contact.find({ user: id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, contacts });
  } catch (error) {
    console.error("Get Contacts Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error while fetching contacts." });
  }
};

module.exports = {
  createContactCtrl,
  getContactsByVendorCtrl,
  getUserInquiryByIdCtrl,
  createGeneralContactCtrl,
};
