import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';

import authRoutes from './routes/auth.js';
import fileRoutes from './routes/file.js';

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://ai-frontend-sigma.vercel.app/",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://ai-generator-backend-production.up.railway.app/"
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', authRoutes);
app.use('/', fileRoutes);

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    app.listen(3000, () => console.log('🚀 Server running on port 3000'));
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

startServer();
