const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription
} = require('../controller/subscriptionController');

// Create a subscription
router.post('/', createSubscription);

// Get all subscriptions
router.get('/', getAllSubscriptions);

// Get a subscription by ID
router.get('/:id', getSubscriptionById);

// Update a subscription
router.put('/:id', updateSubscription);

// Delete a subscription
router.delete('/:id', deleteSubscription);

module.exports = router;
