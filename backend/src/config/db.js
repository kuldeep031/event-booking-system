import mongoose from 'mongoose';
import dns from 'node:dns';

export const connectDB = async (uri) => {
  if (!uri) {
    throw new Error('MONGO_URI is not defined. Check your .env file.');
  }

  // mongodb+srv:// requires a DNS SRV lookup. Some local/ISP resolvers refuse
  // these (querySrv ECONNREFUSED), so route SRV/TXT queries through public DNS.
  if (uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};
