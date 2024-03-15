const express = require('express');
const router = express.Router();
const {
  assignSubscriptionToAdmin,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} = require('../controller/subscriptionAssignController');

// Assign a subscription to an admin
router.post('/', assignSubscriptionToAdmin);

// Get all assignments
router.get('/', getAllAssignments);

// Get an assignment by ID
router.get('/:id', getAssignmentById);

// Update an assignment
router.put('/:id', updateAssignment);

// Delete an assignment
router.delete('/:id', deleteAssignment);

module.exports = router;
