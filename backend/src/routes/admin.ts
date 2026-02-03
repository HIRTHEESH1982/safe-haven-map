import express, { Request, Response } from 'express';
import User from '../models/User';
import Incident from '../models/Incident';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = express.Router();



// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats
// Returns aggregated statistics for the dashboard
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const [
            totalUsers,
            totalReports,
            pendingReports,
            verifiedReports,
            rejectedReports
        ] = await Promise.all([
            User.countDocuments(),
            Incident.countDocuments(),
            Incident.countDocuments({ status: 'pending' }),
            Incident.countDocuments({ status: 'verified' }),
            Incident.countDocuments({ status: 'rejected' })
        ]);

        // Mock data for charts (to be replaced with aggregation later)
        // Aggregate actual reports per day (Last 5 days)
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const reportsAggregation = await Incident.aggregate([
            { $match: { createdAt: { $gte: fiveDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const reportsPerDay = reportsAggregation.map(item => ({
            date: item._id,
            count: item.count
        }));

        const categoryDistribution = await Incident.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        res.json({
            cards: {
                totalUsers,
                totalReports,
                pendingReports,
                verifiedReports,
                rejectedReports,
                reportsToday: 5 // Mock for now or use date query
            },
            charts: {
                reportsPerDay,
                categoryDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// GET /api/admin/users
// List users with pagination and filtering
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(50);
        res.json(users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status || 'active',
            createdAt: user.createdAt
        })));
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// PATCH /api/admin/users/:id
// Update user role or status
router.patch('/users/:id', async (req: Request, res: Response) => {
    try {
        const { role, status } = req.body;

        // Find user first to check current role
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // PROTECT OWNER: Cannot modify an owner account
        if (targetUser.role === 'owner') {
            return res.status(403).json({ message: 'Action forbidden: Cannot modify an Owner account.' });
        }

        // Prevent escalation: Cannot set role to owner via API
        if (role === 'owner') {
            return res.status(403).json({ message: 'Action forbidden: Cannot assign Owner role.' });
        }

        const updateData: any = {};
        if (role) updateData.role = role;
        if (status) updateData.status = status;

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating user' });
    }
});

// DELETE /api/admin/users/:id
// Delete a user
router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid User ID format' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (error: any) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: error.message || 'Server error deleting user' });
    }
});

// GET /api/admin/incidents
// List incidents for moderation
router.get('/incidents', async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const incidents = await Incident.find(query)
            .populate('reportedBy', 'name email')
            .select('-votes -__v')
            .sort({ createdAt: -1 })
            .limit(100);

        console.log('Admin Incidents (sample):', incidents[0] ? JSON.stringify(incidents[0].reportedBy, null, 2) : 'No incidents');

        res.json(incidents.map(inc => ({
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
            status: inc.status,
            moderationReason: inc.moderationReason,
            moderatedBy: inc.moderatedBy
        })));
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching incidents' });
    }
});

// PATCH /api/admin/incidents/:id/status
// Moderate an incident
router.patch('/incidents/:id/status', async (req: AuthRequest, res: Response) => {
    try {
        const { status, reason } = req.body;

        if (!['verified', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            {
                status,
                moderatedBy: req.user?.id,
                moderationReason: reason
            },
            { new: true }
        );

        if (!incident) return res.status(404).json({ message: 'Incident not found' });

        res.json(incident);
    } catch (error) {
        res.status(500).json({ message: 'Server error moderating incident' });
    }
});

// DELETE /api/admin/incidents/:id
// Delete an incident (Rejecting/Removing)
router.delete('/incidents/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const incident = await Incident.findByIdAndDelete(id);
        if (!incident) return res.status(404).json({ message: 'Incident not found' });
        res.json({ message: 'Incident deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting incident' });
    }
});



export default router;
