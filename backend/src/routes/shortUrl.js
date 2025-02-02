const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/ShortUrl');
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Create short URL
router.post('/create', auth, async (req, res) => {
  try {
    const { surveyId } = req.body;
    
    // Check if a short URL already exists for this survey
    let shortUrl = await ShortUrl.findOne({ surveyId });
    
    if (!shortUrl) {
      // Create new short URL if none exists
      const shortCode = crypto.randomBytes(4).toString('hex');
      shortUrl = new ShortUrl({
        originalUrl: `/surveys/${surveyId}/respond`,
        shortCode,
        surveyId
      });
      await shortUrl.save();
    }
    
    // Make sure to use the full URL
    const fullShortUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/s/${shortUrl.shortCode}`;
    
    res.json({ 
      shortUrl: fullShortUrl,
      shortCode: shortUrl.shortCode 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating short URL' });
  }
});

// Get original URL from short code
router.get('/:code', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ shortCode: req.params.code });
    if (!shortUrl) {
      return res.status(404).json({ message: 'Short URL not found' });
    }
    res.json({ redirectUrl: shortUrl.originalUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;