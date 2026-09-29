const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authors: {
    type: [String],
    required: true,
  },
  abstract: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
  },
  category: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  volume: {
    type: String,
  },
  issue: {
    type: String,
  },
  pages: {
    type: String,
  },
  doi: {
    type: String,
  },
  pdfUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Article', articleSchema);
