import axios from 'axios';
import { Incident } from '@/types';

const BASE_URL = import.meta.env.VITE_CHICAGO_CRIME_API_URL;

interface CrimeRecord {
    id: string;
    case_number: string;
    date: string;
    block: string;
    iucr: string;
    primary_type: string;
    description: string;
    location_description: string;
    arrest: boolean;
    domestic: boolean;
    latitude: string;
    longitude: string;
}

export const crimeService = {
    getRecentCrimes: async (): Promise<Incident[]> => {
        try {
            // Fetch last 100 crimes with coordinates
            const response = await axios.get<CrimeRecord[]>(BASE_URL, {
                params: {
                    '$limit': 200,
                    '$where': 'latitude IS NOT NULL AND longitude IS NOT NULL',
                    '$order': 'date DESC'
                }
            });

            return response.data.map(record => ({
                id: record.id,
                title: record.primary_type,
                description: record.description,
                latitude: parseFloat(record.latitude),
                longitude: parseFloat(record.longitude),
                severity: determineSeverity(record.primary_type),
                category: 'other', // You might want to map this better
                reportedAt: record.date,
                location: record.block,
                votes: 0,
                reportedBy: 'Chicago Police Dept',
                verified: true
            }));
        } catch (error) {
            console.error('Error fetching crime data:', error);
            return [];
        }
    }
};

const determineSeverity = (type: string): 'low' | 'medium' | 'high' => {
    const highSeverity = ['HOMICIDE', 'CRIMINAL SEXUAL ASSAULT', 'ROBBERY', 'BATTERY', 'ASSAULT', 'WEAPONS VIOLATION'];
    const mediumSeverity = ['THEFT', 'BURGLARY', 'MOTOR VEHICLE THEFT', 'NARCOTICS', 'CRIMINAL DAMAGE'];

    if (highSeverity.includes(type)) return 'high';
    if (mediumSeverity.includes(type)) return 'medium';
    return 'low';
};
