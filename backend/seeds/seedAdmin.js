import '../config/dnsResolver.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const createAdminUser = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI ? 'URI found' : 'URI MISSING');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Mongoose connected!');

    const admins = [
      { email: 'admin@nutri.co', password: 'admin918', role: 'admin' },
      { email: 'admin@healthcart.com', password: 'admin123', role: 'admin' },
    ];

    for (const a of admins) {
      const exists = await Admin.findOne({ email: a.email });
      if (!exists) {
        await Admin.create(a);
        console.log(`✅ Created admin: ${a.email}`);
      } else {
        console.log(`ℹ️ Admin already exists: ${a.email}`);
      }
    }

    console.log('Admin users verified!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdminUser();
