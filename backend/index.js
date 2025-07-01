require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const articleRoutes = require('./routes/article');
const commentRoutes = require('./routes/comment');
const crawlerRoutes = require('./routes/crawler');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('TrendWise Backend API');
});

app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/crawler', crawlerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 