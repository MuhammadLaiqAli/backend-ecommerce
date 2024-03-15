const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    invoice: {
      type: Number,
      required: false,
    },
    cart: [{}],
   user_info: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      contact: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
      zipCode: {
        type: String,
        required: false,
      },
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
   
    total: {
      type: Number,
      required: true,
    },
    shippingOption: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    cardInfo: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    store: {
      type: String,
      enum: ['magento', 'zid', 'amazon', 'salla'],
    },
  },
  {
    timestamps: true,
  }
);

const Order =mongoose.model(
    'Order',
    orderSchema.plugin(AutoIncrement, {
      inc_field: 'invoice',
      start_seq: 10000,
    })
  );
module.exports = Order;
