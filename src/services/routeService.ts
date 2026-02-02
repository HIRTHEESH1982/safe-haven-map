import api from './api'; // Use the configured axios instance

export interface RouteResponse {
    features: {
        geometry: {
            coordinates: [number, number][];
        };
        properties: {
            summary: {
                distance: number;
                duration: number;
            };
        };
    }[];
}

export const routeService = {
    getRoute: async (start: [number, number], end: [number, number]): Promise<[number, number][]> => {
        try {
            // Call our backend proxy
            const response = await api.get<RouteResponse>('proxy/route', {
                params: {
                    start: `${start[1]},${start[0]}`, // ORS expects lng,lat
                    end: `${end[1]},${end[0]}`
                }
            });

            if (response.data.features && response.data.features.length > 0) {
                // ORS returns [lng, lat], Leaflet expects [lat, lng]
                return response.data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            }
            return [];
        } catch (error) {
            console.error('Error fetching route:', error);
            throw error;
        }
    }
};
