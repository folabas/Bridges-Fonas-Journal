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
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Upload PDFs as image type so Cloudinary can render thumbnails ──
// Using resource_type:'image' with format:'pdf' is the key fix —
// Cloudinary can then transform page 1 to a JPG thumbnail on the fly.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bijst_articles',
    resource_type: 'image',   // CRITICAL: allows page-thumbnail transforms
    format: 'pdf',
    access_mode: 'public',    // ensure public access
  },
});
const upload = multer({ storage });

// Helper: build a public thumbnail URL from a PDF public_id
function makeThumbnail(public_id) {
  return cloudinary.url(public_id, {
    resource_type: 'image',
    format: 'jpg',
    transformation: [
      { width: 800, crop: 'scale' },
      { quality: 'auto', fetch_format: 'auto' },
      { page: 1 },
    ],
  });
}

// Helper: build a public download URL (fl_attachment forces download)
function makeDownloadUrl(public_id) {
  return cloudinary.url(public_id, {
    resource_type: 'image',
    format: 'pdf',
    flags: 'attachment',
    sign_url: true,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// POST /api/admin/login
// ────────────────────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }
  const payload = { user: { role: 'admin' } };
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
    if (err) throw err;
    res.json({ token });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/admin/articles  (list with stats)
// ────────────────────────────────────────────────────────────────────────────
router.get('/articles', auth, async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// ────────────────────────────────────────────────────────────────────────────
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Article.countDocuments();
    const totalDownloads = await Article.aggregate([
      { $group: { _id: null, sum: { $sum: '$downloads' } } },
    ]);
    const byCategory = await Article.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({
      total,
      totalDownloads: totalDownloads[0]?.sum || 0,
      byCategory,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/admin/articles  (create)
// ────────────────────────────────────────────────────────────────────────────
router.post('/articles', auth, upload.single('pdf'), async (req, res) => {
  try {
    const { title, authors, abstract, keywords, category, year, volume, issue, pages, doi } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a PDF file' });
    }

    const authorsArr  = typeof authors  === 'string' ? authors.split(',').map(a => a.trim())  : authors;
    const keywordsArr = typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords;

    const pdfPublicId = req.file.filename || req.file.public_id;
    // pdfUrl: direct Cloudinary URL (pdf format, public)
    const pdfUrl = cloudinary.url(pdfPublicId, {
      resource_type: 'image',
      format: 'pdf',
    });
    // Thumbnail: first page rendered as JPG
    const thumbnailUrl = makeThumbnail(pdfPublicId);

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
      pdfPublicId,
      thumbnailUrl,
    });

    const article = await newArticle.save();
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/articles/:id  (update metadata)
// ────────────────────────────────────────────────────────────────────────────
router.put('/articles/:id', auth, upload.single('pdf'), async (req, res) => {
  try {
    const { title, authors, abstract, keywords, category, year, volume, issue, pages, doi } = req.body;
    const fields = {};

    if (title)    fields.title    = title;
    if (authors)  fields.authors  = typeof authors  === 'string' ? authors.split(',').map(a => a.trim())  : authors;
    if (abstract) fields.abstract = abstract;
    if (keywords) fields.keywords = typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords;
    if (category) fields.category = category;
    if (year)     fields.year     = parseInt(year);
    if (volume)   fields.volume   = volume;
    if (issue)    fields.issue    = issue;
    if (pages)    fields.pages    = pages;
    if (doi)      fields.doi      = doi;

    // If a new PDF is uploaded, replace it
    if (req.file) {
      const pdfPublicId = req.file.filename || req.file.public_id;
      fields.pdfPublicId   = pdfPublicId;
      fields.pdfUrl        = cloudinary.url(pdfPublicId, { resource_type: 'image', format: 'pdf' });
      fields.thumbnailUrl  = makeThumbnail(pdfPublicId);
    }

    let article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: 'Article not found' });

    article = await Article.findByIdAndUpdate(req.params.id, { $set: fields }, { new: true });
    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/articles/:id
// ────────────────────────────────────────────────────────────────────────────
router.delete('/articles/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: 'Article not found' });

    // Delete from Cloudinary (resource_type:'image' because we uploaded as image)
    if (article.pdfPublicId) {
      await cloudinary.uploader.destroy(article.pdfPublicId, { resource_type: 'image' });
    } else {
      // Fallback: parse public_id from URL
      const parts = article.pdfUrl.split('/upload/');
      if (parts.length === 2) {
        const pathPart = parts[1].replace(/^v\d+\//, '').replace(/\.pdf$/, '');
        await cloudinary.uploader.destroy(pathPart, { resource_type: 'image' });
      }
    }

    await Article.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Article removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/admin/articles/:id/download  (increment download counter)
// ────────────────────────────────────────────────────────────────────────────
router.post('/articles/:id/download', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ msg: 'Not found' });
    res.json({ downloads: article.downloads });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
