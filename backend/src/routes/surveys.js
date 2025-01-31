const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const auth = require('../middleware/auth');

// Create a new survey
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, questions, isPublic, endDate } = req.body;
    const survey = new Survey({
      title,
      description,
      questions,
      isPublic,
      endDate,
      creator: req.user.id
    });

    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: 'Error creating survey', error: error.message });
  }
});

// Get all public surveys
router.get('/public', async (req, res) => {
  try {
    const surveys = await Survey.find({ isPublic: true })
      .populate('creator', 'username')
      .select('-responses');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching surveys', error: error.message });
  }
});

// Get user's created surveys
router.get('/my-surveys', auth, async (req, res) => {
  try {
    const surveys = await Survey.find({ creator: req.user.id })
      .populate('creator', 'username');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching surveys', error: error.message });
  }
});

// Get survey by ID or shareable link
router.get('/:identifier', async (req, res) => {
  try {
    const survey = await Survey.findOne({
      $or: [
        { _id: req.params.identifier },
        { shareableLink: req.params.identifier }
      ]
    }).populate('creator', 'username');

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!survey.isPublic) {
      return res.status(403).json({ message: 'This survey is private' });
    }

    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching survey', error: error.message });
  }
});

// Submit survey response
router.post('/:id/respond', auth, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const response = {
      respondent: req.user.id,
      answers: req.body.answers
    };

    survey.responses.push(response);
    await survey.save();

    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting response', error: error.message });
  }
});

module.exports = router;