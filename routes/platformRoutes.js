const express = require('express');
const router = express.Router();
const {
  createPlatform,
  getAllPlatforms,
  getPlatformById,
  updatePlatform,
  deletePlatform
} = require('../controller/platformController');

// Create a platform
router.post('/', createPlatform);

// Get all platforms
router.get('/', getAllPlatforms);

// Get a platform by ID
router.get('/:id', getPlatformById);

// Update a platform
router.put('/:id', updatePlatform);

// Delete a platform
router.delete('/:id', deletePlatform);

module.exports = router;
