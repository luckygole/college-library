const mongoose = require("mongoose");

const PdfSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
});

module.exports = mongoose.model("Pdf", PdfSchema);
