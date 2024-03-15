const mongoose = require('mongoose');

// Define schema
const Schema = mongoose.Schema;

const magentoStoreSchema = new Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, // Assuming userID refers to a User model's ObjectId
    required: true,
    ref: 'Admin' // This is optional but useful if you want to reference a User model
  },
  storeUrl: { type: String, required: true },
  consumerSecret: { type: String, required: true },
  consumerKey: { type: String, required: true },
  accessToken: { type: String, required: true },
  accessTokenSecret: { type: String, required: true },
  isActive: { type: Boolean, default: true }, // For activate/deactivate
  isSubscribed: { type: Boolean, default: true }, // For subscribe/unsubscribe
  
}, {
  timestamps: true
});

// Compile model from schema
const MagentoStore = mongoose.model('MagentoStore', magentoStoreSchema);

module.exports = MagentoStore;
