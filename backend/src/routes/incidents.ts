import express, { Request, Response } from 'express';
import Incident from '../models/Incident';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all incidents
router.get('/', async (req: Request, res: Response) => {
    try {
        const incidents = await Incident.find().sort({ createdAt: -1 });
        // Transform specifically to flatten _id to id if needed, but frontend likely handles it.
        // Let's standardise response format
        res.json({
            success: true, data: incidents.map(inc => ({
                id: inc._id,
                title: inc.title,
                description: inc.description,
                category: inc.category,
                severity: inc.severity,
                latitude: inc.latitude,
                longitude: inc.longitude,
                location: inc.location,
                reportedBy: inc.reportedBy,
                reportedAt: inc.createdAt,
                verified: inc.verified,
                votes: inc.votes
            }))
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create an incident
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, category, severity, latitude, longitude, location } = req.body;

        const newIncident = new Incident({
            title,
            description,
            category,
            severity: severity || 'medium', // Default severity
            latitude,
            longitude,
            location,
            reportedBy: req.user?.id,
            verified: false
        });

        const incident = await newIncident.save();

        // Return formatted incident
        res.json({
            success: true, data: {
                id: incident._id,
                title: incident.title,
                description: incident.description,
                category: incident.category,
                severity: incident.severity,
                latitude: incident.latitude,
                longitude: incident.longitude,
                location: incident.location,
                reportedBy: incident.reportedBy,
                reportedAt: incident.createdAt,
                verified: incident.verified,
                votes: incident.votes
            }
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get user incidents
router.get('/user/:userId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const incidents = await Incident.find({ reportedBy: req.params.userId }).sort({ createdAt: -1 });
        res.json({
            success: true, data: incidents.map(inc => ({
                id: inc._id,
                title: inc.title,
                description: inc.description,
                category: inc.category,
                severity: inc.severity,
                latitude: inc.latitude,
                longitude: inc.longitude,
                location: inc.location,
                reportedBy: inc.reportedBy,
                reportedAt: inc.createdAt,
                verified: inc.verified,
                votes: inc.votes
            }))
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
