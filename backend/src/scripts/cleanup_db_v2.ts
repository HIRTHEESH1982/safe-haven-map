import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Incident from '../models/Incident';
import User from '../models/User';

// Force load env from explicit path
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const cleanup = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error(`MONGO_URI is missing. Loaded env keys: ${Object.keys(process.env).join(',')}`);
        }

        console.log('Connecting to Mongo...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Unsetting votes and __v...');
        const result = await Incident.updateMany({}, { $unset: { votes: "", __v: "" } });
        console.log('Result:', result);

        // Verify
        const doc = await Incident.findOne().populate('reportedBy');
        if (doc) {
            console.log('Sample verified:', {
                id: doc._id,
                votes: (doc as any).votes,
                __v: (doc as any).__v,
                reportedBy: (doc.reportedBy as any)?.name || doc.reportedBy
            });
        } else {
            console.log('No documents found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanup();
