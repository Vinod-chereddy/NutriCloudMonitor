import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to reliable public DNS resolvers (Google / Cloudflare) to prevent ISP DNS timeouts on MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('DNS server configuration notice:', dnsErr.message);
}

// Prevent Mongoose from buffering queries for 10 seconds when DB is temporarily unreachable
mongoose.set('bufferTimeoutMS', 1500);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcart';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to prevent Windows IPv6 DNS/TLS handshake timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Notice: ${error.message}`);
    console.log('💡 Note: Ensure your IP is whitelisted in MongoDB Atlas Network Access and MONGODB_URI is valid in backend/.env');
  }
};

export default connectDB;
