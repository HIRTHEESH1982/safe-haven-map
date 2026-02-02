import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User from '../models/User';

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // req.user is already populated by authMiddleware
        // But we should fetch the latest role from DB to be safe
        const user = await User.findById(req.user?.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Server error authorizing admin access' });
    }
};
