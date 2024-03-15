const mongoose = require('mongoose');

const subscriptionAssignSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true // Set to true if every subscription assignment must be linked to an admin
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true // Set to true if you need to link a subscription for every assignment
  }
});

const SubscriptionAssign = mongoose.model('SubscriptionAssign', subscriptionAssignSchema);
module.exports = SubscriptionAssign;