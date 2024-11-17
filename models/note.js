// const mongoose = require("mongoose");

// // Define schema for uploaded notes
// const noteSchema = new mongoose.Schema({
//   title: String, // Field for the title of the PDF
//   filename: String,
//   uploadDate: { type: Date, default: Date.now },
//   filePath: String,
//   subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
// });

// // Create and export Note model
// module.exports = mongoose.model("Note", noteSchema);


const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  pdfLink: {
    type: String, // Ensure this field is a String to store the URL
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
});

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;

