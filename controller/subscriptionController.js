// Assuming Subscription model is already defined
const Subscription = require('../models/Subscription');

// Create
const createSubscription = async (req, res, next) => {
    try {
      const subscription = new Subscription(req.body);
      await subscription.save();
      res.send(subscription);
    } catch (error) {
      next(error);
    }
  };
  
  // Read (Get a single subscription by ID)
  const getSubscriptionById = async (id) => {
    try {
      const subscription = await Subscription.findById(id).populate('platforms');
      return subscription;
    } catch (error) {
      throw error;
    }
  };
  
  // Read (Get all subscriptions)
  const getAllSubscriptions = async (req, res) => {
    try {
      const subscriptions = await Subscription.find({}).populate('platforms');
      res.send(subscriptions);
      // return subscriptions;
    } catch (error) {
      throw error;
    }
  };
  
  // Update
  const updateSubscription = async (req, res, next) => {
    try {
      const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.send(subscription);
    } catch (error) {
      next(error);
    }
  };
  
  // Delete
  const deleteSubscription = async (req, res, next) => {
    try {
      console.log("iuuiiiji" + req.params.id)
      await Subscription.findByIdAndDelete(req.params.id);
      res.send({ message: 'Subscription successfully deleted' });
    } catch (error) {
      next(error);
    }
};
  
  
  module.exports = {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription
  };