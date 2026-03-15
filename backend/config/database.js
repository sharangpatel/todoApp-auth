import mongoose from "mongoose";

const connectDB = async() => {
  try {
    await mongoose.connect(process.env.DB_URI)
    console.log('Mongo-db connected successfully')
  } catch (error) {
    console.error("MongoDB connection error is here :", error);
    process.exit(1)
  }
}

export default connectDB