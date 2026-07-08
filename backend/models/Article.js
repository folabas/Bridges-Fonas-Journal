const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: String, required: true },
  abstract: { type: String, required: true },
  fileUrl: { type: String }, // Link to published PDF
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
