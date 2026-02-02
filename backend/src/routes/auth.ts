import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

import { sendOTP } from '../utils/email';

// Register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            // If user exists but is not verified, resend OTP
            if (!user.isVerified) {
                // Generate new OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.otp = otp;
                user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

                // Hash password (update in case changed)
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                user.name = name; // Update name

                await user.save();
                await sendOTP(email, otp);
                return res.json({ message: 'OTP sent', email });
            }
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
            isVerified: false
        });

        await user.save();

        // Send Email
        const emailSent = await sendOTP(email, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Error sending email' });
        }

        res.json({ message: 'OTP sent', email });

    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid User' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP Expired' });
        }

        // Verify User
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Create token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user?.id, name: user?.name, email: user?.email } });
            }
        );

    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user?.id, name: user?.name, email: user?.email } });
            }
        );
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get User (Me)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('-password');
        res.json(user);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
