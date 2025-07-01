const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  meta: { type: String },
  media: [{ type: String }],
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  user: {
    name: String,
    email: String,
    image: String
  },
});

module.exports = mongoose.model('Article', ArticleSchema); 