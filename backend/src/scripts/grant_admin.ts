
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const grantAdmin = async () => {
    const email = 'admin@safehaven.com';
    const password = 'Password123';
    const name = 'Admin User';

    try {
        // Connect to MongoDB
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user
            user.password = hashedPassword;
            user.role = 'owner';
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            console.log(`User ${email} updated to OWNER.`);
        } else {
            // Create new user
            user = new User({
                name,
                email,
                password: hashedPassword,
                role: 'owner',
                isVerified: true,
                status: 'active'
            });
            await user.save();
            console.log(`User ${email} created as OWNER.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error granting admin access:', error);
        process.exit(1);
    }
};

grantAdmin();
