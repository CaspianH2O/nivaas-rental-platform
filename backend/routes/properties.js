const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload image endpoint
router.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Get all properties (with optional filters)
router.get('/', async (req, res) => {
  const { location, minPrice, maxPrice, facilities } = req.query;
  let filter = {};
  if (location) filter.location = location;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (facilities) filter.facilities = { $all: facilities.split(',') };
  try {
    const properties = await Property.find(filter).populate('owner', 'name email');
    res.json(properties);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create property (owner only)
router.post('/', auth, async (req, res) => {
  const { title, description, price, address, location, facilities, images } = req.body;
  try {
    const property = new Property({
      title,
      description,
      price,
      address,
      location,
      facilities,
      images,
      owner: req.user
    });
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email_id');
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update property (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    if (property.owner.toString() !== req.user) return res.status(401).json({ msg: 'Not authorized' });
    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(property);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete property (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    if (property.owner.toString() !== req.user) return res.status(401).json({ msg: 'Not authorized' });
    await property.deleteOne();
    res.json({ msg: 'Property removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;