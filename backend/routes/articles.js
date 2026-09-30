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

// @route   POST /api/articles/:id/download  (public — increments counter)
router.post('/:id/download', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ msg: 'Not found' });
    res.json({ pdfUrl: article.pdfUrl, downloads: article.downloads });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
