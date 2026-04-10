const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Property = require('../models/Property');

// GET /api/recommendations
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const prefs = user.preferences || {};

    const aiResponse = await axios.post('http://localhost:5001/recommend', {
      location: prefs.location || '',
      budget: prefs.budget || 0,
      facilities: prefs.facilities || []
    });

    const recommendedIds = aiResponse.data.map(p => p._id);
    const properties = await Property.find({ '_id': { $in: recommendedIds } }).populate('owner', 'name email');

    // preserve order
    const ordered = recommendedIds.map(id => properties.find(p => p._id.toString() === id)).filter(p => p);
    res.json(ordered);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'AI service error' });
  }
});

module.exports = router;