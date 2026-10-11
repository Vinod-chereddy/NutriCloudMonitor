import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';

export const getCart = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        cart: { items: [], total: 0 },
      });
    }
    const cart = await Cart.findOne({ userId: req.user.userId }).populate(
      'items.productId'
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], total: 0 },
      });
    }

    // Filter out items where productId is null (deleted products)
    const validItems = cart.items.filter(item => item.productId != null);

    // Format them so frontend item.product works perfectly:
    const formattedItems = validItems.map(item => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
      selectedVariant: item.selectedVariant || ''
    }));

    const total = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.status(200).json({
      success: true,
      cart: {
        items: formattedItems,
        total,
      },
    });
  } catch (error) {
    console.warn('Cart retrieval notice:', error.message);
    res.status(200).json({
      success: true,
      cart: { items: [], total: 0 },
      notice: error.message
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedVariant, price: customPrice } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Please provide product ID and quantity' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const itemPrice = customPrice || product.price;
    const variantLabel = selectedVariant || '';

    let cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.userId,
        items: [
          {
            productId,
            quantity,
            price: itemPrice,
            selectedVariant: variantLabel,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId && (item.selectedVariant || '') === variantLabel
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: itemPrice,
          selectedVariant: variantLabel,
        });
      }

      await cart.save();
    }

    // Log activity
    try {
      await ActivityLog.create({
        userId: req.user.userId,
        action: 'add_to_cart',
        details: {
          productId,
          productName: product.name,
          quantity,
        },
      });
    } catch (logErr) {
      console.warn('ActivityLog error on add_to_cart:', logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId, selectedVariant } = req.body;

    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (selectedVariant !== undefined) {
      cart.items = cart.items.filter(
        (item) => !(item.productId.toString() === productId && (item.selectedVariant || '') === (selectedVariant || ''))
      );
    } else {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, quantity, selectedVariant } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId && (selectedVariant === undefined || (item.selectedVariant || '') === (selectedVariant || ''))
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
