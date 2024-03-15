// Assuming SubscriptionAssign model is already defined
const SubscriptionAssign = require('../models/SubscriptionAssign');

// Create
const assignSubscriptionToAdmin = async (data) => {
    try {
      const assignment = new SubscriptionAssign(data);
      await assignment.save();
      return assignment;
    } catch (error) {
      throw error;
    }
  };
  
  // Read (Get a single assignment by ID)
  const getAssignmentById = async (id) => {
    try {
      const assignment = await SubscriptionAssign.findById(id).populate('adminId').populate('subscriptionId');
      return assignment;
    } catch (error) {
      throw error;
    }
  };
  
  // Read (Get all assignments)
  const getAllAssignments = async () => {
    try {
      const assignments = await SubscriptionAssign.find({}).populate('adminId').populate('subscriptionId');
      return assignments;
    } catch (error) {
      throw error;
    }
  };
  
  // Update
  const updateAssignment = async (id, data) => {
    try {
      const assignment = await SubscriptionAssign.findByIdAndUpdate(id, data, { new: true });
      return assignment;
    } catch (error) {
      throw error;
    }
  };
  
  // Delete
  const deleteAssignment = async (id) => {
    try {
      await SubscriptionAssign.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  };
  

  module.exports = {
    assignSubscriptionToAdmin,
    getAllAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
  };