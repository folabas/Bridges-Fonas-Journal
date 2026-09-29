const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Article = require('../models/Article');
const auth = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bijst_articles',
    resource_type: 'raw', // For PDFs
    format: async (req, file) => 'pdf',
  },
});
const upload = multer({ storage: storage });

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  const payload = {
    user: {
      role: 'admin'
    }
  };

  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '24h' },
    (err, token) => {
      if (err) throw err;
      res.json({ token });
    }
  );
});

// @route   POST /api/admin/articles
// @desc    Create an article
// @access  Private (Admin)
router.post('/articles', auth, upload.single('pdf'), async (req, res) => {
  try {
    const { title, authors, abstract, keywords, category, year, volume, issue, pages, doi } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a PDF file' });
    }

    // Process authors and keywords from comma separated string if necessary
    const authorsArr = typeof authors === 'string' ? authors.split(',').map(a => a.trim()) : authors;
    const keywordsArr = typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords;

    const pdfUrl = req.file.path; // Cloudinary secure URL for raw file
    const public_id = req.file.filename;

    // Cloudinary automatically extracts thumbnail for PDFs if requested via image transformation
    // The format is usually: https://res.cloudinary.com/<cloud_name>/image/upload/pg_1/<public_id>.jpg
    const thumbnailUrl = cloudinary.url(public_id, {
      resource_type: 'image',
      format: 'jpg',
      page: 1,
      width: 800,
      crop: 'scale'
    });

    const newArticle = new Article({
      title,
      authors: authorsArr,
      abstract,
      keywords: keywordsArr,
      category,
      year: parseInt(year),
      volume,
      issue,
      pages,
      doi,
      pdfUrl,
      thumbnailUrl
    });

    const article = await newArticle.save();
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT /api/admin/articles/:id
// @desc    Update an article
// @access  Private (Admin)
router.put('/articles/:id', auth, async (req, res) => {
  try {
    const { title, authors, abstract, keywords, category, year, volume, issue, pages, doi } = req.body;

    const articleFields = {};
    if (title) articleFields.title = title;
    if (authors) articleFields.authors = typeof authors === 'string' ? authors.split(',').map(a => a.trim()) : authors;
    if (abstract) articleFields.abstract = abstract;
    if (keywords) articleFields.keywords = typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords;
    if (category) articleFields.category = category;
    if (year) articleFields.year = parseInt(year);
    if (volume) articleFields.volume = volume;
    if (issue) articleFields.issue = issue;
    if (pages) articleFields.pages = pages;
    if (doi) articleFields.doi = doi;

    let article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: 'Article not found' });

    article = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: articleFields },
      { new: true }
    );

    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE /api/admin/articles/:id
// @desc    Delete an article
// @access  Private (Admin)
router.delete('/articles/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ msg: 'Article not found' });
    }

    // Delete from Cloudinary
    // Extract public_id from pdfUrl (e.g., .../upload/v1234/bijst_articles/xyz.pdf -> bijst_articles/xyz.pdf)
    // Cloudinary raw resource deletion requires resource_type 'raw'
    const parts = article.pdfUrl.split('/upload/');
    if (parts.length === 2) {
      const pathPart = parts[1].split('/').slice(1).join('/'); // remove version e.g. v12345/
      const public_id = pathPart; 
      await cloudinary.uploader.destroy(public_id, { resource_type: 'raw' });
    }

    await Article.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Article removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
