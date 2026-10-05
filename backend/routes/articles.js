const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// @route   GET /api/articles
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const query = {};
    if (req.query.year)   query.year = req.query.year;
    if (req.query.volume) query.volume = req.query.volume;
    if (req.query.category) query.category = { $regex: req.query.category, $options: 'i' };
    if (req.query.search) {
      query.$or = [
        { title:    { $regex: req.query.search, $options: 'i' } },
        { authors:  { $regex: req.query.search, $options: 'i' } },
        { keywords: { $regex: req.query.search, $options: 'i' } },
        { abstract: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total    = await Article.countDocuments(query);
    const articles = await Article.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json({ articles, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET /api/articles/:id
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ msg: 'Article not found' });
    res.json(article);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Article not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
});

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @route   POST /api/articles/:id/download  (public — increments counter)
router.post('/:id/download', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ msg: 'Not found' });

    let finalUrl = article.pdfUrl;

    if (article.pdfUrl && article.pdfUrl.includes('cloudinary.com')) {
      // Determine if it was uploaded as raw or image
      const isRaw = article.pdfUrl.includes('/raw/upload/');
      
      // Extract the public_id from the URL if pdfPublicId is not reliably set
      let publicId = article.pdfPublicId;
      if (!publicId) {
        const parts = article.pdfUrl.split('/upload/');
        if (parts.length === 2) {
          // Remove version string (e.g. v1790766512/)
          publicId = parts[1].replace(/^v\d+\//, '');
          // For images, format is separate. For raw, extension is part of public_id.
          if (!isRaw) {
             publicId = publicId.replace(/\.pdf$/, '');
          }
        }
      } else {
         // If pdfPublicId was saved from multer, it might not have the extension for images, but for raw it usually does.
         if (isRaw && !publicId.endsWith('.pdf')) {
            publicId += '.pdf';
         }
      }

      if (publicId) {
        finalUrl = cloudinary.url(publicId, {
          resource_type: isRaw ? 'raw' : 'image',
          type: 'upload',
          format: isRaw ? '' : 'pdf', 
          flags: 'attachment',
          sign_url: true,
          secure: true,
        });
      }
    }

    res.json({ pdfUrl: finalUrl, downloads: article.downloads });
  } catch (err) {
    console.error('Download Error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
