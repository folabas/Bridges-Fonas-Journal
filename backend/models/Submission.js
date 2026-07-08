const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  title: { type: String, required: true },
  surname: { type: String, required: true },
  otherNames: { type: String, required: true },
  gender: { type: String, required: true },
  affiliation: { type: String, required: true },
  manuscriptTitle: { type: String, required: true },
  researchArea: { type: String, required: true },
  keywords: { type: String, required: true },
  coAuthors: { type: String },
  fileUrl: { type: String }, // To be populated by Cloudinary later
  cloudinaryId: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
