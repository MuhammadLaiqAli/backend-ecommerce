const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: false // Depending on whether you always want an image or not
    },
    platforms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Platform'
    }]
  });
  
  const Subscription = mongoose.model('Subscription', subscriptionSchema);
  module.exports = Subscription;