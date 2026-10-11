import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { calculateRiskScoreAndStatus } from '../utils/calculateRiskScore.js';
import { emitSecurityAlert, emitRiskScoreUpdate, emitActivityLog } from '../utils/socketEmitter.js';

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentDetails } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Please provide shipping address' });
    }

    let items = [];

    // Support items provided directly in request body (e.g., from checkout modal state)
    if (Array.isArray(req.body.items) && req.body.items.length > 0) {
      items = req.body.items.map((item) => ({
        productId: item.productId || item.product?._id || item._id,
        name: item.name || item.product?.name || 'Nutrition Product',
        quantity: Math.max(1, Number(item.quantity) || 1),
        price: Number(item.price) || Number(item.product?.price) || 0,
        selectedVariant: item.selectedVariant || '',
      }));
    } else {
      const cart = await Cart.findOne({ userId: req.user.userId }).populate(
        'items.productId'
      );

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const validItems = cart.items.filter(item => item.productId != null);

      if (validItems.length === 0) {
        return res.status(400).json({ message: 'Cart has no valid items' });
      }

      items = validItems.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        price: item.price,
        selectedVariant: item.selectedVariant || '',
      }));
    }

    if (items.length === 0) {
      return res.status(400).json({ message: 'No valid items found for checkout' });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const now = new Date();
    const trackingEvents = [
      {
        status: 'Order Confirmed',
        location: 'NutriKart Central Hub (Bengaluru)',
        timestamp: now,
        message: `Order verified and payment confirmed via ${paymentMethod || 'UPI'}.`,
      },
      {
        status: 'Packed',
        location: 'NutriKart Warehouse Bay #4',
        timestamp: new Date(now.getTime() + 45 * 60 * 1000),
        message: 'Order items packed with 100% genuine tamper-proof seal.',
      },
    ];

    const order = await Order.create({
      userId: req.user.userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'UPI',
      paymentDetails: {
        upiId: paymentDetails?.upiId || '',
        transactionId: paymentDetails?.transactionId || `NK-TXN-${Date.now()}`,
        paymentStatus: paymentDetails?.paymentStatus || 'Success',
      },
      status: 'Completed',
      orderStatus: 'Order Confirmed',
      trackingEvents,
    });

    // Detect Rapid Checkout Activity (Behavioral SOC Event)
    const recentOrders = await ActivityLog.countDocuments({
      userId: req.user.userId,
      action: { $in: ['checkout', 'RAPID_REQUESTS'] },
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 mins
    });

    const isRapidVelocity = recentOrders >= 2;
    const actionType = isRapidVelocity ? 'RAPID_REQUESTS' : 'checkout';

    // Log activity
    try {
      const log = await ActivityLog.create({
        userId: req.user.userId,
        action: actionType,
        details: {
          orderId: order._id,
          totalAmount,
          itemCount: items.length,
          velocityWarning: isRapidVelocity,
          orderCountInWindow: recentOrders + 1
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      emitActivityLog(log);
    } catch (logErr) {
      console.warn('ActivityLog error on order create:', logErr.message);
    }

    // If velocity anomaly detected, elevate user risk score & emit SOC alert
    if (isRapidVelocity) {
      const user = await User.findById(req.user.userId);
      if (user) {
        const { riskScore, systemStatus } = calculateRiskScoreAndStatus(
          user.failedLoginAttempts,
          user.totalFailedAttempts,
          { rapidVelocity: true }
        );

        user.riskScore = Math.max(user.riskScore, riskScore);
        if (systemStatus === 'HighRisk' || user.systemStatus === 'Safe') {
          user.systemStatus = systemStatus;
        }
        await user.save();

        emitRiskScoreUpdate({
          userId: user._id,
          riskScore: user.riskScore,
          systemStatus: user.systemStatus,
        });

        emitSecurityAlert({
          type: 'RAPID_CHECKOUT_VELOCITY',
          risk: 'HIGH',
          user: user.email,
          ip: req.ip || 'Remote Node',
          description: `User triggered ${recentOrders + 1} checkouts within 5 minutes ($${totalAmount}). Potential card testing / bot order stream.`
        });
      }
    }

    // Clear cart safely
    try {
      await Cart.updateOne({ userId: req.user.userId }, { items: [] });
    } catch (cartClearErr) {
      console.warn('Cart clearing notice:', cartClearErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        orders: [],
      });
    }
    const orders = await Order.find({ userId: req.user.userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled.' });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason || 'Customer requested cancellation';
    order.trackingEvents.push({
      status: 'Cancelled',
      location: 'Customer Self-Service',
      timestamp: new Date(),
      message: `Order cancelled by customer: ${reason || 'Cancellation requested'}`
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewOrder = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.rating = Number(rating) || 5;
    order.review = review || '';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Product review saved successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
