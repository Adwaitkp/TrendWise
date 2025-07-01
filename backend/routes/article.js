const express = require('express');
const Article = require('../models/Article');
const router = express.Router();
const multer = require('multer');
const path = require('path');
// Placeholder for authentication middleware
// const requireAuth = require('../middleware/authMiddleware');

// Multer setup for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /api/articles - List all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/articles/:slug - Get article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate('user', 'name email');
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/articles - Create a new article (with image upload)
// router.post('/', requireAuth, upload.single('image'), async (req, res) => {
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, slug, meta, content, userName, userEmail, userImage } = req.body;
    // const userId = req.user._id; // Uncomment when using auth
    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }
    let media = [];
    if (req.file) {
      media.push(`/uploads/${req.file.filename}`);
    }
    const article = new Article({
      title,
      slug,
      meta,
      media,
      content,
      user: { name: userName, email: userEmail, image: userImage }
    });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 