import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/route', async (req: Request, res: Response) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ message: 'Start and end coordinates are required' });
        }

        const API_KEY = process.env.ORS_API_KEY;
        const BASE_URL = process.env.ORS_API_URL || 'https://api.openrouteservice.org/v2/directions/driving-car';

        const response = await axios.get(BASE_URL, {
            params: {
                api_key: API_KEY,
                start,
                end
            }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Error fetching route from ORS:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Error fetching route' });
        }
    }
});

export default router;
