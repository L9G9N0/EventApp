import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_registration_db';
    
    // Log the URI without credentials for security
    const sanitizedUri = mongoUri.replace(/\/\/.*@/, '//<credentials>@');
    console.log(`Connecting to MongoDB at: ${sanitizedUri}`);

    await mongoose.connect(mongoUri);

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};
