import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to reliable public DNS resolvers (Google / Cloudflare) to prevent ISP DNS timeouts on MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('DNS server configuration notice:', dnsErr.message);
}

// Resilient Mongoose query buffering for cloud deployments (prevents timeout on cold starts or network latency)
mongoose.set('bufferTimeoutMS', 25000);

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // Auto-detect if MONGODB_URI was accidentally pasted into another env variable (like PORT)
    if (!mongoUri || !mongoUri.startsWith('mongodb')) {
      if (process.env.PORT && process.env.PORT.startsWith('mongodb')) {
        mongoUri = process.env.PORT;
      } else {
        mongoUri = 'mongodb+srv://vinodkumarreddycv_db_user:xVfW9IJvrPsOOxfe@cluster0.31kjofb.mongodb.net/healthcart?retryWrites=true&w=majority&appName=Cluster0';
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Notice: ${error.message}`);
  }
};

export default connectDB;
