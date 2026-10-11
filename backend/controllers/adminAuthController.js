import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const generateToken = (adminId) => {
  return jwt.sign({ adminId, isAdmin: true }, process.env.JWT_SECRET || 'nutricloud_jwt_secret_key_2026_secure', {
    expiresIn: '30d',
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = String(email || '').trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Built-in emergency/demo admin credentials support (works even before DB seed or during offline testing)
    if (
      (email === 'admin@nutri.co' && password === 'admin918') ||
      (email === 'admin@healthcart.com' && password === 'admin123') ||
      (email === 'vinodkumarreddycv@gmail.com' && password === 'admin918')
    ) {
      const token = generateToken('admin-master-id');
      return res.status(200).json({
        success: true,
        token,
        admin: {
          id: 'admin-master-id',
          email,
          role: 'admin',
        },
      });
    }

    // Try MongoDB query if connected
    try {
      const admin = await Admin.findOne({ email }).select('+password');

      if (admin) {
        const isPasswordMatch = await admin.comparePassword(password);
        if (isPasswordMatch) {
          const token = generateToken(admin._id);
          return res.status(200).json({
            success: true,
            token,
            admin: {
              id: admin._id,
              email: admin.email,
              role: admin.role,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB query notice in adminLogin:', dbErr.message);
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminRegister = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = String(email || '').trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      email,
      password,
      role: 'admin',
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
