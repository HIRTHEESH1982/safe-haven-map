import express, { Request, Response } from 'express';
import Incident from '../models/Incident';
import User from '../models/User';

const router = express.Router();

// GET /api/stats
// Public stats for homepage
router.get('/', async (req: Request, res: Response) => {
    try {
        const [
            totalIncidents,
            highPriority,
            verifiedReports,
            totalUsers
        ] = await Promise.all([
            Incident.countDocuments(),
            Incident.countDocuments({ severity: 'high' }),
            Incident.countDocuments({ status: 'verified' }),
            User.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                totalIncidents,
                highPriority,
                verifiedReports,
                totalUsers
            }
        });
    } catch (err: any) {
        console.error('Stats Error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
