import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, GeoJSON } from 'react-leaflet';
import 'leaflet-polylinedecorator';
import L from 'leaflet';
import axios from 'axios';
import * as turf from '@turf/turf';
import { CHICAGO_CENTER, Incident, IncidentSeverity } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Red dot icon for crime data
const redDotIcon = new L.DivIcon({
  className: 'custom-red-dot',
  html: `<div style="background:#d00;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 2px #000;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

// Custom marker icons based on severity
const createIcon = (severity: IncidentSeverity) => {
  const colors: Record<IncidentSeverity, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${colors[severity]};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface MapViewProps {
  incidents: Incident[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (incident: Incident) => void;
  clickableMap?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  routeCoordinates?: [number, number][];
  startCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
  route?: any;
  routeType?: 'direct' | 'optimized';
  avoidPolygons?: any;
  crimeData?: any[];
}

const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

// Component to handle map resize issues more robustly
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    // Observe the map container's parent
    if (map.getContainer().parentElement) {
      resizeObserver.observe(map.getContainer().parentElement!);
    }

    // Also trigger once on mount after a delay
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
};

// Component to handle map center updates
const MapUpdater: React.FC<{ center: { lat: number; lng: number }, zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  return null;
};

// Route with arrows component
function RouteWithArrows({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length < 2) return;

    // Remove previous decorators
    map.eachLayer(layer => {
      if (layer instanceof L.Layer && (layer as any)._isRouteArrow) {
        map.removeLayer(layer);
      }
    });

    // Create polyline
    const polyline = L.polyline(coordinates, {
      color: '#2563eb',
      weight: 5,
      dashArray: '10, 10',
    }).addTo(map);

    // Add arrows
    const decorator = (L as any).polylineDecorator(polyline, {
      patterns: [
        {
          offset: 25,
          repeat: 50,
          symbol: (L as any).Symbol ? (L as any).Symbol.arrowHead({
            pixelSize: 15,
            polygon: false,
            pathOptions: { stroke: true, color: '#2563eb', weight: 2 }
          }) : null
        }
      ]
    }).addTo(map);

    // Mark as custom for cleanup
    (polyline as any)._isRouteArrow = true;
    (decorator as any)._isRouteArrow = true;

    return () => {
      map.removeLayer(polyline);
      map.removeLayer(decorator);
    };
  }, [coordinates, map]);

  return null;
}

const MapView: React.FC<MapViewProps> = ({
  incidents,
  center = CHICAGO_CENTER,
  zoom = 13,
  onMarkerClick,
  clickableMap = false,
  onMapClick,
  routeCoordinates,
  startCoords,
  destCoords,
  route,
  routeType,
  avoidPolygons,
  crimeData = [],
}) => {
  // Filter out invalid incidents (ensure numbers are finite)
  const validIncidents = incidents.filter(
    i => typeof i.latitude === 'number' && !isNaN(i.latitude) &&
      typeof i.longitude === 'number' && !isNaN(i.longitude)
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizer />
      <MapUpdater center={center} zoom={zoom} />

      {clickableMap && onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      {/* Display crime data */}
      {crimeData.map((crime, idx) => (
        <Marker
          key={idx}
          position={[crime.latitude, crime.longitude]}
          icon={redDotIcon}
        >
          <Popup>
            <div>
              <b>{crime.primary_type || 'Crime'}</b><br />
              {crime.date && <span>Date: {crime.date}<br /></span>}
              {crime.description && <span>{crime.description}</span>}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Display route start marker */}
      {startCoords && (
        <Marker position={startCoords}>
          <Popup>Start</Popup>
        </Marker>
      )}

      {/* Display route destination marker */}
      {destCoords && (
        <Marker position={destCoords}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {/* Display calculated route with arrows */}
      {route && route.geometry && route.geometry.coordinates && (
        <RouteWithArrows coordinates={route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])} />
      )}

      {/* Display avoid polygons for optimized route */}
      {routeType === 'optimized' && avoidPolygons && (
        <GeoJSON data={avoidPolygons} style={{ color: 'red', fillOpacity: 0.15 }} />
      )}

      {/* Display legacy route coordinates */}
      {routeCoordinates && (
        <Polyline
          positions={routeCoordinates}
          color="blue"
          weight={4}
          opacity={0.7}
        />
      )}

      {validIncidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.latitude, incident.longitude]}
          icon={createIcon(incident.severity)}
          eventHandlers={{
            click: () => onMarkerClick?.(incident),
          }}
        >
          <Popup>
            <div className="min-w-[200px] p-2">
              <h3 className="font-semibold text-foreground">{incident.title}</h3>
              <div className="mt-1 flex gap-2">
                <Badge
                  className={
                    incident.severity === 'high'
                      ? 'bg-destructive text-destructive-foreground'
                      : incident.severity === 'medium'
                        ? 'bg-warning text-warning-foreground'
                        : 'bg-success text-success-foreground'
                  }
                >
                  {incident.severity}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{incident.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                📍 {incident.location}
              </p>
              <p className="text-xs text-muted-foreground">
                🕐 {(() => {
                  try {
                    return incident.reportedAt ? formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true }) : 'Unknown time';
                  } catch (e) {
                    return 'Time unavailable';
                  }
                })()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
