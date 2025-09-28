import dotenv from 'dotenv';
dotenv.config();

import app from './app/app.js';
import { connectDB } from './config/dbConnect.js';

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`HazardWatch API running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
