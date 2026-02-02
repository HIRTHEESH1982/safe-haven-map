import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
}

// Component to handle map clicks
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

const MapView: React.FC<MapViewProps> = ({
  incidents,
  center = CHICAGO_CENTER,
  zoom = 13,
  onMarkerClick,
  clickableMap = false,
  onMapClick,
}) => {
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

      {clickableMap && onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      {incidents.map((incident) => (
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
                🕐 {formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true })}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
