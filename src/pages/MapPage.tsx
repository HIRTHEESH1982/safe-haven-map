import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import MapView from '@/components/map/MapView';
import { useIncidents } from '@/hooks/useIncidents';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import * as turf from '@turf/turf';

const DEFAULT_START = "233 S Wacker Dr, Chicago, IL"; // Willis Tower

const MapPage: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();
  const { toast } = useToast();

  // Crime data from Chicago API
  const [crimeData, setCrimeData] = useState<any[]>([]);

  // Route state
  const [start, setStart] = useState(DEFAULT_START);
  const [destination, setDestination] = useState('');
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [routeType, setRouteType] = useState<'direct' | 'optimized'>('direct');
  const [avoidPolygons, setAvoidPolygons] = useState<any>(null);
  const isMounted = useRef(true);

  // Fetch crime data from Chicago API
  useEffect(() => {
    isMounted.current = true;
    axios
      .get('https://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=1000')
      .then(res => {
        if (isMounted.current) {
          const allowedTypes = [
            'THEFT',
            'ASSAULT',
            'CRIM SEXUAL ASSAULT',
            'SEX OFFENSE',
            'HARASSMENT',
            'ACCIDENT'
          ];
          const filtered = res.data
            .filter(
              (d: any) =>
                d.latitude &&
                d.longitude &&
                d.primary_type &&
                allowedTypes.includes(d.primary_type.toUpperCase())
            )
            .map((d: any) => ({
              ...d,
              latitude: Number(d.latitude),
              longitude: Number(d.longitude)
            }));
          setCrimeData(filtered);
        }
      })
      .catch(err => {
        console.error('Error fetching crime data:', err);
      });
    return () => {
      isMounted.current = false;
    };
  }, []);



  // Geocode with Nominatim
  const geocode = async (address: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address + ', Chicago, IL'
    )}`;
    const res = await axios.get(url);
    if (res.data && res.data.length > 0) {
      return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
    }
    return null;
  };

  // Direct route (OpenRouteService)
  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    const apiKey =
      "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjNkNmMzMjZhMDdlMjRiYjFiNTVkZTgzM2FkNGZmNmZhIiwiaCI6Im11cm11cjY0In0=";
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`;
    const res = await axios.get(url);
    if (res.data?.features?.length > 0) return res.data.features[0];
    return null;
  };

  // Optimized route (avoid polygons)
  const fetchOptimizedRoute = async (
    start: [number, number],
    end: [number, number],
    avoidPolygons: any
  ) => {
    const apiKey =
      "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjNkNmMzMjZhMDdlMjRiYjFiNTVkZTgzM2FkNGZmNmZhIiwiaCI6Im11cm11cjY0In0=";
    const body: any = {
      coordinates: [
        [start[1], start[0]],
        [end[1], end[0]]
      ],
      options: {}
    };
    if (avoidPolygons) {
      body.options.avoid_polygons = avoidPolygons;
    }
    const res = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      body,
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    if (res.data?.features?.length > 0) return res.data.features[0];
    return null;
  };

  // Handle form submit for route calculation
  const handleRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const sCoords = await geocode(start);
    const dCoords = await geocode(destination);
    setStartCoords(sCoords as [number, number] | null);
    setDestCoords(dCoords as [number, number] | null);
    if (sCoords && dCoords) {
      let routeData = null;
      if (routeType === 'direct') {
        setAvoidPolygons(null);
        routeData = await fetchRoute(
          sCoords as [number, number],
          dCoords as [number, number]
        );
      } else if (routeType === 'optimized') {
        const directRoute = await fetchRoute(
          sCoords as [number, number],
          dCoords as [number, number]
        );
        const routeLine = turf.lineString(directRoute.geometry.coordinates);
        const routeBuffer = turf.buffer(routeLine, 0.05, { units: 'kilometers' }) as any;
        const closeCrimes = crimeData.filter(crime => {
          const pt = turf.point([crime.longitude, crime.latitude]);
          return turf.booleanPointInPolygon(pt, routeBuffer);
        });
        const buffers = closeCrimes.map(crime =>
          turf.buffer(
            turf.point([crime.longitude, crime.latitude]),
            0.05,
            { units: 'kilometers' }
          )
        );
        let unioned: any = null;
        if (buffers.length > 0) {
          unioned = buffers[0];
          for (let i = 1; i < buffers.length; i++) {
            try {
              unioned = turf.union(unioned, buffers[i]);
            } catch {}
          }
        }
        let avoid = null;
        if (unioned?.geometry?.coordinates?.length > 0) {
          avoid = unioned.geometry;
        }
        setAvoidPolygons(avoid);
        routeData = await fetchOptimizedRoute(
          sCoords as [number, number],
          dCoords as [number, number],
          avoid
        );
      }
      setRoute(routeData);
      toast({
        title: "Route Calculated",
        description: `${routeType === 'direct' ? 'Direct' : 'Optimized'} route displayed on map.`,
      });
    }
  };

  // Handle map clicks
  const handleMapClick = (lat: number, lng: number) => {
    // Map click handler for future features
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem-4rem)] flex-col md:h-[calc(100vh-4rem)]">
        {/* Header Bar */}
        <div className="border-b bg-card p-4">
          <div className="container">
            {/* Route Calculator */}
            <form onSubmit={handleRoute} className="flex gap-3 flex-wrap items-center">
              <input
                type="text"
                value={start}
                onChange={e => setStart(e.target.value)}
                placeholder="Start address"
                className="p-2 rounded border flex-1 min-w-[250px] text-sm"
              />
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Destination address"
                className="p-2 rounded border flex-1 min-w-[250px] text-sm"
              />
              <select
                value={routeType}
                onChange={e => setRouteType(e.target.value as 'direct' | 'optimized')}
                className="p-2 rounded border text-sm"
                aria-label="Route type"
              >
                <option value="direct">Direct Path</option>
                <option value="optimized">Avoid Risk Zones</option>
              </select>
              <Button type="submit" size="sm" className="gap-2">
                <MapPin className="h-4 w-4" />
                Calculate Route
              </Button>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              Loading map...
            </div>
          ) : (
            <MapView
              incidents={incidents || []}
              crimeData={crimeData}
              onMarkerClick={() => {}}
              clickableMap={true}
              onMapClick={handleMapClick}
              startCoords={startCoords}
              destCoords={destCoords}
              route={route}
              routeType={routeType}
              avoidPolygons={avoidPolygons}
            />
          )}
        </div>
      </div>

    </Layout>
  );
};

export default MapPage;
