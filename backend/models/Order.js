import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.Mixed,
          ref: 'Product',
        },
        name: String,
        quantity: Number,
        price: Number,
        selectedVariant: { type: String, default: '' },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Processing', 'Cancelled'],
      default: 'Completed',
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'NetBanking', 'COD'],
      default: 'UPI',
    },
    paymentDetails: {
      upiId: { type: String, default: '' },
      transactionId: { type: String, default: '' },
      paymentStatus: { type: String, default: 'Success' },
    },
    orderStatus: {
      type: String,
      enum: ['Order Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Confirmed',
    },
    trackingId: {
      type: String,
      default: () => 'EKART' + Math.floor(100000000 + Math.random() * 900000000),
    },
    courier: {
      type: String,
      default: 'Ekart Logistics',
    },
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    trackingEvents: [
      {
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        message: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    review: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
