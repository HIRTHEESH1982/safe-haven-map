import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { CHICAGO_CENTER, Incident, IncidentSeverity } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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

const MapView: React.FC<MapViewProps> = ({
  incidents,
  center = CHICAGO_CENTER,
  zoom = 13,
  onMarkerClick,
  clickableMap = false,
  onMapClick,
  routeCoordinates,
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
