const express = require('express');
const Comment = require('../models/Comment');
const router = express.Router();

// GET /api/comments/:articleId - Get all comments for an article
router.get('/:articleId', async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/comments/:articleId - Post a new comment for an article
router.post('/:articleId', async (req, res) => {
  try {
    const { user, comment } = req.body;
    if (!user || !comment) return res.status(400).json({ error: 'User and comment are required' });
    const newComment = new Comment({
      article: req.params.articleId,
      user,
      comment,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 