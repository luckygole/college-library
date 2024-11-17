const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Pdf = require("../models/PdfModel");

const router = express.Router();

// Cloudinary Config

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
})


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "pdfs", // Folder to store files in Cloudinary
        resource_type: "raw", // Ensure Cloudinary treats files as raw
        public_id: (req, file) => {
            const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, ""); // Remove existing extension
            return `${Date.now()}-${nameWithoutExt}`; // Unique and clean filename
        },
    },
});





const upload = multer({ storage });


router.post("/", upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error("No file uploaded");
        }

        console.log("Cloudinary File Details:", req.file); // Log full details

        const { originalname } = req.file;
        const { path } = req.file; // URL of the uploaded file

        // Save the file to MongoDB
        const newPdf = new Pdf({
            name: originalname,
            url: path,
        });
        await newPdf.save();

        console.log("Uploaded PDF:", newPdf);
        res.status(200).json({
            message: "PDF uploaded successfully.",
            pdf: newPdf,
        });
    } catch (err) {
        console.error("Upload Error:", err.message);
        res.status(500).json({
            message: "Error uploading PDF",
            error: err.message,
        });
    }
});


module.exports = router;
