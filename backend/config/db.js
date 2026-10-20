import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to reliable public DNS resolvers on local dev machines to prevent ISP DNS timeouts on Atlas SRV records
if (!process.env.RENDER && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    console.warn('DNS server configuration notice:', dnsErr.message);
  }
}

// Prevent Mongoose from freezing requests for 25 seconds when disconnected:
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 1500);

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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Notice: ${error.message}`);
    if (error.message.includes('whitelist') || error.message.includes('Could not connect')) {
      console.log(`\n-----------------------------------------------------------`);
      console.log(`💡 FIX FOR LOCAL DATABASE ACCESS:`);
      console.log(`   1. Open MongoDB Atlas: https://cloud.mongodb.com`);
      console.log(`   2. Navigate to: Security -> Network Access`);
      console.log(`   3. Click "Add IP Address" -> Select "Allow Access from Anywhere" (0.0.0.0/0)`);
      console.log(`   4. Click "Confirm" and wait 1 minute for changes to take effect.`);
      console.log(`-----------------------------------------------------------\n`);
    }
  }
};

export default connectDB;
