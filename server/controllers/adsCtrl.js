const { uploadImageToCloudinary } = require("../config/imageUploader");
const adsModel = require("../models/adsModel")

const createAddCtrl = async (req, res) => {
    try {
        const { url } = req.body;
        const image = req.files.image;

        if (!url || !image) {
            return res.status(400).json({
                success: false,
                message: "Please provide all fields"
            })
        }

        const thumbnailImage = await uploadImageToCloudinary(image, process.env.FOLDER_NAME);

        const ad = await adsModel.create({
            image: thumbnailImage.secure_url,
            url,
        })
        return res.status(201).json({
            success: true,
            message: "Ads created successfully!",
            ad
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in createing ads api!"
        })
    }
}

const getAllAds = async (req, res) => {
    try {
        const ads = await adsModel.find({});
        return res.status(200).json({
            success: true,
            ads
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in getting ads api!"
        })
    }
}

const deleteAddCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        await adsModel.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Ad delete successfully!"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in deleting ads api!"
        })
    }
}

module.exports = { createAddCtrl, getAllAds, deleteAddCtrl }