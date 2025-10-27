const Contact = require('../models/contactModel');

const createContactCtrl = async (req, res) => {
    try {
        const { name, email, phone, message, property } = req.body;

        if (!name || !email || !phone || !property) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const vendor = property.vendor;

        const newContact = new Contact({
            name,
            email,
            phone,
            message,
            vendor,
            property
        });

        await newContact.save();

        res.status(201).json({
            success: true,
            message: 'Contact created successfully.',
            newContact
        });

    } catch (error) {
        console.error('Create Contact Error:', error);
        res.status(500).json({ success: false, error: 'Server error while creating contact.' });
    }
};

const getContactsByVendorCtrl = async (req, res) => {
    try {
        const { id } = req.params;


        const contacts = await Contact.find({ vendor: id }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, contacts });

    } catch (error) {
        console.error('Get Contacts Error:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching contacts.' });
    }
};

module.exports = { createContactCtrl, getContactsByVendorCtrl };