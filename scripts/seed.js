import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hazard from '../models/hazardModel.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const sampleHazards = [
    {
        hazardType: 'Wildfire',
        severity: 'severe',
        description: 'Large wildfire spreading rapidly through forest area.',
        location: '41.2132,-124.0046',
        tags: ['help','warning'],
        source: 'Drone Footage',
        verified: true,
        reportedBy: 'Fire Department'
    },
    {
        hazardType: 'Flood',
        severity: 'high',
        description: 'Severe flooding in residential areas.',
        location: '38.5556,-121.4689',
        tags: ['warning'],
        source: 'Citizen Report',
        verified: false,
        reportedBy: 'Local Resident'
    },
    // Add more if needed
];

const seedDatabase = async () => {
    await connectDB();
    try {
        console.log('Clearing existing hazards...');
        await Hazard.deleteMany({});
        console.log('Seeding sample hazards...');
        const inserted = await Hazard.insertMany(sampleHazards);
        console.log(`Inserted ${inserted.length} hazards`);
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
};

seedDatabase();
