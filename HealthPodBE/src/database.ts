import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // eslint-disable-next-line no-console
    console.warn("MONGODB_URI not set. Skipping database connection.");
    return;
  }

  try {
    await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection failed", error);
  }
}

