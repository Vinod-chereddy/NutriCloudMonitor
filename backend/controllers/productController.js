import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cached fallback 500 products
let fallbackProducts = null;
const loadFallbackProducts = () => {
  if (fallbackProducts && fallbackProducts.length > 0) return fallbackProducts;
  try {
    const filePath = path.join(__dirname, '../data/products_500.json');
    if (fs.existsSync(filePath)) {
      fallbackProducts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return fallbackProducts;
    }
  } catch (err) {
    console.error('Error loading fallback products:', err.message);
  }
  return [];
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    let products = [];
    let dbSuccess = false;

    // 1. Attempt database query if MongoDB is connected
    if (Product.db && Product.db.readyState === 1) {
      try {
        const filter = {};
        if (category) filter.category = category;
        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ];
        }
        if (minPrice || maxPrice) {
          filter.price = {};
          if (minPrice) filter.price.$gte = parseFloat(minPrice);
          if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        products = await Product.find(filter).sort({ createdAt: -1 });
        dbSuccess = true;
      } catch (dbErr) {
        console.warn('MongoDB query warning, using fallback dataset:', dbErr.message);
      }
    }

    // 2. If DB is unavailable, serve from the 500 products dataset
    if (!dbSuccess) {
      let items = loadFallbackProducts();
      if (category) {
        items = items.filter(p => p.category?.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      }
      if (minPrice) {
        items = items.filter(p => p.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        items = items.filter(p => p.price <= parseFloat(maxPrice));
      }
      products = items;
    }

    // 3. Log user activity asynchronously (non-blocking) so catalog loading is instant (<10ms)
    if (req.user && req.user.userId && ActivityLog.db && ActivityLog.db.readyState === 1) {
      ActivityLog.create({
        userId: req.user.userId,
        action: 'view_product',
        details: { category, search },
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    let product = null;

    if (Product.db && Product.db.readyState === 1) {
      try {
        product = await Product.findById(req.params.id);
      } catch (err) {}
    }

    if (!product) {
      const items = loadFallbackProducts();
      product = items.find(p => String(p._id) === String(req.params.id) || String(p.id) === String(req.params.id));
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user && req.user.userId && ActivityLog.db && ActivityLog.db.readyState === 1) {
      ActivityLog.create({
        userId: req.user.userId,
        action: 'view_product',
        details: { productId: product._id, productName: product.name },
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    let categories = [];

    if (Product.db && Product.db.readyState === 1) {
      try {
        categories = await Product.distinct('category');
      } catch (err) {}
    }

    if (!categories || categories.length === 0) {
      const items = loadFallbackProducts();
      categories = [...new Set(items.map(p => p.category))];
    }

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
