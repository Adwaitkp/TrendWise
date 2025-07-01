const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const Article = require('../models/Article');
const googleTrends = require('google-trends-api');
const router = express.Router();

// Helper: Fetch trending topics from Google Trends (real implementation)
async function fetchTrendingTopics() {
  try {
    const results = await googleTrends.dailyTrends({ geo: 'US' });
    const parsed = JSON.parse(results);
    const trends = parsed.default.trendingSearchesDays[0].trendingSearches;
    // Return the top 3 trending topics
    return trends.slice(0, 3).map(t => t.title.query);
  } catch (err) {
    console.error('Error fetching Google Trends:', err);
    // Fallback to static list
    return ['AI', 'Climate Change', 'SpaceX'];
  }
}

// Helper: Fetch trending topics from Twitter (real implementation)
async function fetchTwitterTrends() {
  try {
    // WOEID 1 = Worldwide
    const url = 'https://api.twitter.com/1.1/trends/place.json?id=1';
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${twitterBearerToken}` }
    });
    // Return the top 3 trending topics
    return response.data[0].trends.slice(0, 3).map(t => t.name.replace(/^#/, ''));
  } catch (err) {
    console.error('Error fetching Twitter Trends:', err.response?.data || err.message);
    // Fallback to static list
    return ['OpenAI', 'Tech', 'Sports'];
  }
}

// Helper: Crawl related articles using NewsAPI
async function crawlRelatedArticles(topic) {
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&apiKey=${newsApiKey}`;
    const response = await axios.get(url);
    return response.data.articles.slice(0, 3).map(a => ({
      title: a.title,
      url: a.url,
      source: a.source.name
    }));
  } catch (err) {
    console.error('Error fetching articles:', err.response?.data || err.message);
    return [];
  }
}

// Helper: Crawl related images using Unsplash
async function crawlRelatedImages(topic) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&per_page=3&client_id=${unsplashAccessKey}`;
    const response = await axios.get(url);
    return response.data.results.map(img => img.urls.regular);
  } catch (err) {
    console.error('Error fetching images:', err.response?.data || err.message);
    return [];
  }
}

// Helper: Crawl related videos using YouTube Data API
async function crawlRelatedVideos(topic) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=3&key=${youtubeApiKey}`;
    const response = await axios.get(url);
    return response.data.items.map(v => `https://www.youtube.com/watch?v=${v.id.videoId}`);
  } catch (err) {
    console.error('Error fetching videos:', err.response?.data || err.message);
    return [];
  }
}

// Helper: Generate SEO content using Gemini API
async function generateSEOContent(topic, articles) {
  const prompt = `Write a detailed, SEO-optimized blog post about "${topic}". Include H1, H2, H3, meta description, and references to these articles: ${articles.map(a => a.url).join(', ')}.`;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  try {
    const response = await axios.post(url, body);
    // Gemini's response structure
    return response.data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    throw new Error('Failed to generate content with Gemini');
  }
}

// POST /api/crawler/run - Trigger the content bot
router.post('/run', async (req, res) => {
  try {
    // 1. Fetch trending topics from Google and Twitter
    const [googleTopics, twitterTopics] = await Promise.all([
      fetchTrendingTopics(),
      fetchTwitterTrends()
    ]);
    // Combine and deduplicate topics
    const topics = Array.from(new Set([...googleTopics, ...twitterTopics]));
    const results = [];
    for (const topic of topics) {
      // 2. Crawl related articles
      const relatedArticles = await crawlRelatedArticles(topic);
      // 3. Crawl related images
      const relatedImages = await crawlRelatedImages(topic);
      // 4. Crawl related videos
      const relatedVideos = await crawlRelatedVideos(topic);
      // 5. Generate SEO content
      const content = await generateSEOContent(topic, relatedArticles);
      // 6. Save to DB
      const slug = topic.toLowerCase().replace(/\s+/g, '-');
      const article = new Article({
        title: topic,
        slug,
        meta: `SEO blog post about ${topic}`,
        media: [...relatedArticles.map(a => a.url), ...relatedImages, ...relatedVideos],
        content,
      });
      await article.save();
      results.push(article);
    }
    res.json({ message: 'Crawler completed', articles: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Crawler error', details: err.message });
  }
});

// GET /api/crawler/twitter-trends - Get Twitter trending topics
router.get('/twitter-trends', async (req, res) => {
  try {
    const trends = await fetchTwitterTrends();
    res.json({ trends });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Twitter trends' });
  }
});

module.exports = router; 